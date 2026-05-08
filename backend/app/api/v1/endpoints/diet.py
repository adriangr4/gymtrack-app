import unicodedata
from firebase_admin import firestore as firebase_firestore
from starlette.concurrency import run_in_threadpool
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Any
from app.api.deps import get_current_user
from app.schemas.user import User
from app.schemas.diet import DietPlan, DietPlanCreate, FoodItem
import uuid
from datetime import datetime

router = APIRouter()

def get_diets_ref():
    return firebase_firestore.client().collection('diets')

def normalize(text: str) -> str:

    nfkd = unicodedata.normalize('NFD', text.lower())
    return ''.join(c for c in nfkd if not unicodedata.combining(c))

@router.get("/search", response_model=List[FoodItem])
async def search_food(
    q: str = Query(..., min_length=2),
    page: int = 1
):
    """
    Busca alimentos usando APIs externas gratuitas.
    Prioridad: 1) Open Food Facts  2) USDA FoodData Central  3) Firestore local
    """
    import requests as req

    # --- 1) Intentar Open Food Facts (tiene marcas europeas/españolas) ---
    try:
        off_url = "https://world.openfoodfacts.org/cgi/search.pl"
        off_params = {
            "search_terms": q,
            "search_simple": 1,
            "action": "process",
            "json": 1,
            "page_size": 20,
            "page": page,
            "fields": "product_name,brands,nutriments,image_front_small_url,code",
        }
        off_resp = req.get(off_url, params=off_params, timeout=5, headers={
            "User-Agent": "GymTrack/1.0 (contact@gymtrack.app)"
        })

        if off_resp.status_code == 200:
            data = off_resp.json()
            products = data.get("products", [])
            if products:
                results = []
                for p in products:
                    name = p.get("product_name", "").strip()
                    if not name:
                        continue
                    nuts = p.get("nutriments", {})
                    results.append(FoodItem(
                        name=name,
                        brand=p.get("brands", ""),
                        calories=round(nuts.get("energy-kcal_100g", nuts.get("energy-kcal", 0)) or 0, 1),
                        protein=round(nuts.get("proteins_100g", 0) or 0, 1),
                        carbs=round(nuts.get("carbohydrates_100g", 0) or 0, 1),
                        fat=round(nuts.get("fat_100g", 0) or 0, 1),
                        image_url=p.get("image_front_small_url", ""),
                        barcode=p.get("code", ""),
                        quantity=100,
                        serving_size="100g"
                    ))
                if results:
                    return results
    except Exception as e:
        print(f"WARN: Open Food Facts API failed: {e}", flush=True)

    # --- 2) Fallback: USDA FoodData Central (siempre disponible, sin API key) ---
    try:
        usda_url = "https://api.nal.usda.gov/fdc/v1/foods/search"
        usda_params = {
            "query": q,
            "pageSize": 20,
            "pageNumber": page,
            "api_key": "DEMO_KEY",
        }
        usda_resp = req.get(usda_url, params=usda_params, timeout=8)

        if usda_resp.status_code == 200:
            data = usda_resp.json()
            foods = data.get("foods", [])
            if foods:
                results = []
                for f in foods:
                    nutrients = {n["nutrientName"]: n.get("value", 0) for n in f.get("foodNutrients", [])}
                    results.append(FoodItem(
                        name=f.get("description", "Alimento").title(),
                        brand=f.get("brandName", f.get("brandOwner", "")),
                        calories=round(nutrients.get("Energy", 0) or 0, 1),
                        protein=round(nutrients.get("Protein", 0) or 0, 1),
                        carbs=round(nutrients.get("Carbohydrate, by difference", 0) or 0, 1),
                        fat=round(nutrients.get("Total lipid (fat)", 0) or 0, 1),
                        image_url="",
                        barcode=f.get("gtinUpc", ""),
                        quantity=100,
                        serving_size="100g"
                    ))
                if results:
                    return results
    except Exception as e:
        print(f"WARN: USDA API failed: {e}", flush=True)

    # --- 3) Fallback final: Firestore local ---
    def _search_local():
        db = firebase_firestore.client()
        q_normalized = normalize(q)
        results = []
        all_foods = db.collection('foods').stream()
        for doc in all_foods:
            data = doc.to_dict()
            food_name_norm = normalize(data.get('name', ''))
            if q_normalized in food_name_norm:
                results.append(data)
        results.sort(key=lambda x: (0 if normalize(x['name']).startswith(q_normalized) else 1, x['name']))
        return results[:20]

    local_foods = await run_in_threadpool(_search_local)

    if local_foods:
        return [
            FoodItem(
                name=f.get('name', 'Alimento'),
                brand=f.get('category', ''),
                calories=f.get('calories', 0),
                protein=f.get('protein', 0),
                carbs=f.get('carbs', 0),
                fat=f.get('fat', 0),
                image_url=f.get('image_url', ''),
                barcode=f.get('id', ''),
                quantity=f.get('quantity', 100),
                serving_size=f.get('serving_size', '100g')
            )
            for f in local_foods
        ]

    # --- 4) Nada encontrado: devolver genérico ---
    return [FoodItem(
        name=f"{q.capitalize()} (Genérico)",
        brand="Sin marca",
        calories=100,
        protein=5,
        carbs=10,
        fat=2,
        image_url="",
        barcode="",
        quantity=100,
        serving_size="100g"
    )]

@router.get("/", response_model=List[DietPlan])
async def get_my_diet_plans(
    current_user: User = Depends(get_current_user)
) -> Any:

    try:
        docs = get_diets_ref()\
            .where("user_id", "==", str(current_user.id))\
            .order_by("created_at", direction=firebase_firestore.Query.DESCENDING)\
            .stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            data.setdefault("id", doc.id)
            results.append(data)
        return results
    except Exception as e:
        print(f"WARN: Sorted diet query failed (likely missing index). Falling back to unsorted. Error: {e}")
        docs = get_diets_ref().where("user_id", "==", str(current_user.id)).stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            data.setdefault("id", doc.id)
            results.append(data)
        return results

@router.post("/", response_model=DietPlan)
async def create_diet_plan(
    plan: DietPlanCreate,
    current_user: User = Depends(get_current_user)
) -> Any:

    try:
        plan_data = plan.dict()
        plan_id = str(uuid.uuid4())

        new_plan = {
            "id": plan_id,
            "user_id": str(current_user.id),
            "created_at": datetime.utcnow(),
            **plan_data
        }

        get_diets_ref().document(plan_id).set(new_plan)
        return new_plan
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create diet plan: {str(e)}")

@router.get("/{diet_id}", response_model=DietPlan)
async def get_diet_plan(
    diet_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:

    doc = get_diets_ref().document(diet_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Diet plan not found")

    data = doc.to_dict()
    data.setdefault("id", doc.id)
    return data

@router.delete("/{diet_id}", response_model=dict)
async def delete_diet_plan(
    diet_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:

    doc_ref = get_diets_ref().document(diet_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Diet plan not found")

    data = doc.to_dict()

    if data.get("user_id") != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    doc_ref.delete()
    return {"status": "success", "message": "Diet plan deleted"}
