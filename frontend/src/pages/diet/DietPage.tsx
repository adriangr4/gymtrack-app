import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Flame, Clock, ChevronRight, Star, X, BookOpen, ChefHat, Check, ScanLine } from 'lucide-react';
import { getDiets, getDietsCache, getDiet } from '../../services/diet';
import { getRoutinesCache } from '../../services/routines';
import { useAuth } from '../../context/AuthContext';
import { getDietImage, seedFrom } from '../../lib/imageUtils';
import { getNutritionCache, setNutritionCache, getNutritionToday, logFood } from '../../services/nutrition';
import { TEMPLATE_DIETS } from '../../data/dietTemplates';
import { LevelQuizModal } from '../../components/quiz/LevelQuizModal';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Recipe {
    name: string; kcal: number; time: number; rating: number; img: string;
    categories: string[]; tags?: string[]; description?: string;
    ingredients?: string[]; instructions?: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function Bar({ pct = 0.5, color = 'var(--accent)', h = 3 }: { pct?: number; color?: string; h?: number }) {
    return (
        <div style={{ height: h, borderRadius: h, background: 'var(--line)', overflow: 'hidden', width: '100%' }}>
            <div style={{ height: '100%', width: `${Math.min(pct, 1) * 100}%`, background: color, borderRadius: h, transition: 'width 0.6s' }} />
        </div>
    );
}

function CalorieRing({ pct = 0 }: { pct?: number }) {
    const size = 88, sw = 7, r = (size - sw) / 2, c = 2 * Math.PI * r;
    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={sw} fill="none"/>
                <circle cx={size/2} cy={size/2} r={r} stroke="var(--energy)" strokeWidth={sw} fill="none"
                    strokeDasharray={`${c * Math.min(pct, 1)} ${c}`} strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.8s ease' }}/>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={14} color="var(--energy)"/>
                <div className="num" style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)', lineHeight: 1, marginTop: 2 }}>
                    {Math.round(pct * 100)}%
                </div>
            </div>
        </div>
    );
}

// ─── Recipe modal (bottom sheet) ──────────────────────────────────────────────
function RecipeModal({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
    return (
        <div
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{ width: '100%', maxWidth: 480, background: 'var(--bg)', borderRadius: '24px 24px 0 0', maxHeight: '88dvh', overflowY: 'auto', paddingBottom: 48 }}
            >
                {/* Image */}
                <div style={{ height: 220, position: 'relative', backgroundImage: `url("${recipe.img}")`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '24px 24px 0 0', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)' }}/>
                    <button onClick={onClose} style={{
                        position: 'absolute', top: 14, right: 14,
                        width: 34, height: 34, borderRadius: 11,
                        background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.15)',
                        color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer',
                    }}><X size={16}/></button>
                    <div style={{ position: 'absolute', bottom: 16, left: 18, right: 18 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2 }}>{recipe.name}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#fff', background: 'rgba(0,0,0,0.4)', padding: '4px 10px', borderRadius: 8 }}>
                                <Star size={11} fill="#f59e0b" stroke="#f59e0b"/>{recipe.rating}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--energy)', background: 'rgba(0,0,0,0.4)', padding: '4px 10px', borderRadius: 8 }}>
                                <Flame size={11}/>{recipe.kcal} kcal
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#ccc', background: 'rgba(0,0,0,0.4)', padding: '4px 10px', borderRadius: 8 }}>
                                <Clock size={11}/>{recipe.time} min
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '18px 18px 0' }}>
                    {/* Tags */}
                    {recipe.tags && recipe.tags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                            {recipe.tags.map(tag => (
                                <span key={tag} style={{ fontSize: 11, fontWeight: 500, color: 'var(--fg-mute)', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 999, padding: '4px 10px' }}>{tag}</span>
                            ))}
                        </div>
                    )}

                    {/* Description */}
                    {recipe.description && (
                        <p style={{ fontSize: 14, color: 'var(--fg-mute)', lineHeight: 1.65, marginBottom: 20 }}>{recipe.description}</p>
                    )}

                    {/* Ingredients */}
                    {recipe.ingredients && recipe.ingredients.length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <BookOpen size={16} color="var(--accent)"/> Ingredientes
                            </div>
                            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden' }}>
                                {recipe.ingredients.map((ing, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < recipe.ingredients!.length - 1 ? '1px solid var(--line)' : 'none' }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }}/>
                                        <span style={{ fontSize: 14, color: 'var(--fg)' }}>{ing}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    {recipe.instructions && recipe.instructions.length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ChefHat size={16} color="var(--accent)"/> Instrucciones
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {recipe.instructions.map((step, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: 'var(--accent-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                                        <p style={{ fontSize: 14, color: 'var(--fg-mute)', lineHeight: 1.6, margin: 0, paddingTop: 3 }}>{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Static data ─────────────────────────────────────────────────────────────
const CATEGORIES = [
    { id: 'desayuno', emoji: '🍳', label: 'Desayuno' },
    { id: 'almuerzo', emoji: '🥗', label: 'Almuerzo' },
    { id: 'cena',     emoji: '🌙', label: 'Cena' },
    { id: 'vegana',   emoji: '🌱', label: 'Vegana' },
    { id: 'proteina', emoji: '💪', label: 'Alta proteína' },
    { id: 'rapida',   emoji: '⚡', label: 'Rápida' },
    { id: 'keto',     emoji: '🥑', label: 'Keto' },
];

const CALORIC_RANGES = [
    { label: '< 300 kcal',   emoji: '🍉', color: 'oklch(0.72 0.16 148)', max: 300, min: 0 },
    { label: '300–500 kcal', emoji: '🥞', color: 'oklch(0.72 0.16 55)',  max: 500, min: 300 },
    { label: '500–700 kcal', emoji: '🍝', color: 'oklch(0.72 0.16 30)',  max: 700, min: 500 },
    { label: '> 700 kcal',   emoji: '🍖', color: 'oklch(0.72 0.16 340)', max: 9999, min: 700 },
];

const CURATED_SECTIONS: { title: string; recipes: Recipe[] }[] = [
    {
        title: 'Nuestras favoritas',
        recipes: [
            {
                name: 'Pollo con verduras', kcal: 388, time: 45, rating: 4.7,
                img: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=300&fit=crop',
                categories: ['almuerzo', 'cena', 'proteina', 'keto'],
                tags: ['Alta proteína', 'Sin gluten', 'Saludable'],
                description: 'Pechuga de pollo jugosa a la plancha con verduras asadas de temporada. Saciante, equilibrada y llena de color.',
                ingredients: ['Pechuga de pollo (200g)', 'Pimiento rojo (½)', 'Calabacín (1 ud.)', 'Cebolla (½)', 'Aceite de oliva (1 cda.)', 'Hierbas provenzales', 'Sal y pimienta'],
                instructions: ['Corta las verduras y el pollo en trozos medianos.', 'Marina con aceite y especias 15 min.', 'Asa las verduras en horno a 200°C durante 20 min.', 'Cocina el pollo a la plancha 7 min por lado.', 'Sirve todo junto recién hecho.'],
            },
            {
                name: 'Bowl de salmón', kcal: 420, time: 20, rating: 4.6,
                img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
                categories: ['almuerzo', 'proteina'],
                tags: ['Omega-3', 'Fresco', 'Saludable'],
                description: 'Bowl colorido con salmón fresco, aguacate cremoso, pepino crujiente y semillas tostadas.',
                ingredients: ['Salmón fresco (150g)', 'Arroz cocido (80g)', 'Aguacate (½)', 'Pepino (½)', 'Semillas de sésamo (1 cdita.)', 'Salsa de soja (1 cda.)'],
                instructions: ['Cocina el arroz y déjalo enfriar.', 'Corta el salmón en dados pequeños.', 'Lamina el aguacate y el pepino.', 'Monta el bowl y aliña con salsa de soja.', 'Añade semillas por encima.'],
            },
            {
                name: 'Pasta con pesto', kcal: 510, time: 25, rating: 4.5,
                img: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=400&h=300&fit=crop',
                categories: ['almuerzo', 'cena', 'vegana'],
                tags: ['Vegetariano', 'Rápido', 'Italiano'],
                description: 'Pasta al dente con pesto de albahaca fresca, piñones tostados y queso parmesano rallado.',
                ingredients: ['Pasta (100g seca)', 'Albahaca fresca (20g)', 'Piñones (20g)', 'Ajo (1 diente)', 'Aceite de oliva (3 cdas.)', 'Queso parmesano (30g)', 'Sal al gusto'],
                instructions: ['Cuece la pasta en agua con sal al dente.', 'Tritura albahaca, piñones, ajo y aceite hasta obtener una pasta.', 'Mezcla la pasta escurrida con el pesto.', 'Añade queso rallado y sirve inmediatamente.'],
            },
        ],
    },
    {
        title: 'Desayunos energéticos',
        recipes: [
            {
                name: 'Overnight oats', kcal: 310, time: 5, rating: 4.7,
                img: 'https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?w=400&h=300&fit=crop',
                categories: ['desayuno', 'vegana', 'rapida'],
                tags: ['Vegano', 'Sin cocción', 'Saciante'],
                description: 'Avena con leche vegetal preparada la noche anterior. Lista al despertar, sin necesidad de cocinar.',
                ingredients: ['Avena (60g)', 'Leche de avena (150ml)', 'Semillas de chía (1 cdita.)', 'Frutos rojos (50g)', 'Miel (1 cda.)', 'Canela al gusto'],
                instructions: ['Mezcla avena, leche y chía en un tarro.', 'Añade miel y canela al gusto.', 'Tapa y refrigera toda la noche.', 'Sirve con frutos rojos por encima al día siguiente.'],
            },
            {
                name: 'Tostada de aguacate', kcal: 280, time: 10, rating: 4.6,
                img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop',
                categories: ['desayuno', 'vegana', 'rapida'],
                tags: ['Vegano', 'Grasas saludables', 'Rápido'],
                description: 'Tostada crujiente con aguacate machacado, limón y semillas. Desayuno completo en 10 minutos.',
                ingredients: ['Pan integral (2 rebanadas)', 'Aguacate maduro (1)', 'Limón (½)', 'Semillas de sésamo (1 cdita.)', 'Sal y pimienta', 'Hojuelas de chile (opcional)'],
                instructions: ['Tuesta el pan hasta que quede dorado.', 'Machaca el aguacate con zumo de limón.', 'Extiende generosamente sobre las tostadas.', 'Añade semillas y especias al gusto.'],
            },
            {
                name: 'Batido de proteínas', kcal: 250, time: 5, rating: 4.5,
                img: 'https://images.unsplash.com/photo-1553530666-ba11a90a3431?w=400&h=300&fit=crop',
                categories: ['desayuno', 'proteina', 'rapida'],
                tags: ['Alta proteína', 'Post-entreno', 'Rápido'],
                description: 'Batido cremoso con proteína en polvo, plátano y mantequilla de cacahuete. Perfecto tras el entreno.',
                ingredients: ['Proteína en polvo (1 scoop)', 'Leche desnatada (300ml)', 'Plátano (½)', 'Mantequilla de cacahuete (1 cda.)', 'Hielo al gusto'],
                instructions: ['Añade todos los ingredientes a la batidora.', 'Bate durante 30 segundos hasta que quede cremoso.', 'Sirve y toma inmediatamente.'],
            },
        ],
    },
    {
        title: 'Alta en proteínas',
        recipes: [
            {
                name: 'Pechuga a la plancha', kcal: 220, time: 20, rating: 4.7,
                img: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop',
                categories: ['almuerzo', 'cena', 'proteina', 'keto'],
                tags: ['Alta proteína', 'Keto', 'Sin carbohidratos'],
                description: 'Pechuga de pollo jugosa cocinada a la plancha con especias mediterráneas y zumo de limón.',
                ingredients: ['Pechuga de pollo (200g)', 'Limón (½)', 'Ajo en polvo (½ cdita.)', 'Pimentón dulce (½ cdita.)', 'Aceite de oliva (1 cdita.)', 'Sal y pimienta negra'],
                instructions: ['Aplana la pechuga con un mazo de cocina.', 'Marina con limón y especias durante 10 min.', 'Cocina en plancha caliente 7 min por cada lado.', 'Deja reposar 3 min antes de cortar.'],
            },
            {
                name: 'Tortilla de claras', kcal: 180, time: 10, rating: 4.6,
                img: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400&h=300&fit=crop',
                categories: ['desayuno', 'almuerzo', 'proteina', 'keto', 'rapida'],
                tags: ['Alta proteína', 'Keto', 'Bajo en grasa'],
                description: 'Tortilla esponjosa con claras de huevo, espinacas y queso bajo en grasa. Rápida y muy nutritiva.',
                ingredients: ['Claras de huevo (5 ud.)', 'Espinacas frescas (30g)', 'Queso bajo en grasa (30g)', 'Cebolla (¼)', 'Aceite en spray', 'Sal y pimienta'],
                instructions: ['Bate las claras con sal y pimienta.', 'Sofríe la cebolla y espinacas 2 min en sartén.', 'Añade las claras y cocina 3 min a fuego medio.', 'Añade el queso por encima y dobla la tortilla.'],
            },
            {
                name: 'Atún con quinoa', kcal: 370, time: 15, rating: 4.5,
                img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
                categories: ['almuerzo', 'proteina', 'rapida'],
                tags: ['Alta proteína', 'Sin gluten', 'Completo'],
                description: 'Combinación perfecta de proteína magra y carbohidratos complejos. Saciante, nutritivo y muy rápido.',
                ingredients: ['Quinoa (80g seca)', 'Atún al natural (1 lata 160g)', 'Tomates cherry (8 ud.)', 'Aceite de oliva (1 cda.)', 'Limón (¼)', 'Perejil fresco'],
                instructions: ['Cuece la quinoa 12 min en el doble de agua.', 'Escurre el atún.', 'Mezcla quinoa tibia, atún y tomates cortados.', 'Aliña con aceite y zumo de limón.', 'Añade perejil picado al servir.'],
            },
        ],
    },
];

const TEMPLATES = [
    { id: 'keto-basic',    name: 'Keto',          kcal: 1800, desc: 'Bajo en carbohidratos, alto en grasa',       img: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=400&h=300&fit=crop' },
    { id: 'mediterranean', name: 'Mediterránea',   kcal: 2100, desc: 'Equilibrada y rica en grasas saludables',   img: 'https://images.unsplash.com/photo-1576402187878-974f70c890a5?w=400&h=300&fit=crop' },
    { id: 'high-protein',  name: 'Alta proteína',  kcal: 2400, desc: 'Máximo músculo, mínima grasa',              img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop' },
];

// ─── Component ───────────────────────────────────────────────────────────────
export function DietPage() {
    const { user } = useAuth();
    const [tab, setTab] = useState<'hoy' | 'descubrir' | 'planes'>('hoy');
    const [activeCategory, setActiveCategory] = useState('desayuno');
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [selectedRange, setSelectedRange] = useState<{ min: number; max: number } | null>(null);
    const [userDiets, setUserDiets] = useState<any[]>(() => getDietsCache() || []);
    const [nutrition, setNutrition] = useState<any>(() => getNutritionCache() || {
        total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0, goal_calories: 2400,
    });
    const [activeDietMeals, setActiveDietMeals] = useState<any[]>([]);
    const [loggedHoy, setLoggedHoy] = useState<Set<string>>(new Set());
    const [showProGate, setShowProGate] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const isPro = user?.is_pro;

    const routines = getRoutinesCache() || [];
    const activeRoutine = routines.find((r: any) => r.id === user?.current_routine_id);

    // Resolve active diet — could be template or user diet
    const currentDietId = user?.current_diet_id;
    const activeDietFromTemplate = currentDietId && TEMPLATE_DIETS[currentDietId]
        ? { id: currentDietId, ...TEMPLATE_DIETS[currentDietId] }
        : null;
    const activeDiet = userDiets.find((d: any) => d.id === currentDietId) || activeDietFromTemplate;

    const goalKcal = nutrition?.goal_calories || activeRoutine?.daily_calories_target || activeDiet?.daily_calories_target || user?.daily_calorie_goal || 2400;
    const consumed = nutrition?.total_calories || 0;
    const pct = goalKcal > 0 ? consumed / goalKcal : 0;
    const remaining = Math.max(0, goalKcal - consumed);

    useEffect(() => {
        if (!user?.id) return;
        getDiets(user.id).then(setUserDiets).catch(console.error);
        getNutritionToday(user.id).then(d => { setNutrition(d); setNutritionCache(d); }).catch(console.error);
    }, [user?.id]);

    // Load active diet's meal plan
    useEffect(() => {
        if (!currentDietId) { setActiveDietMeals([]); return; }
        if (TEMPLATE_DIETS[currentDietId]) {
            setActiveDietMeals(TEMPLATE_DIETS[currentDietId].meals || []);
        } else {
            getDiet(currentDietId)
                .then(d => setActiveDietMeals(d?.meals || []))
                .catch(() => setActiveDietMeals([]));
        }
    }, [currentDietId]);

    const macros = [
        { name: 'Proteína', value: Math.round(nutrition?.total_protein || 0), target: Math.round(goalKcal * 0.30 / 4), color: 'var(--energy)' },
        { name: 'Carbs',    value: Math.round(nutrition?.total_carbs   || 0), target: Math.round(goalKcal * 0.40 / 4), color: 'var(--data)' },
        { name: 'Grasas',   value: Math.round(nutrition?.total_fat     || 0), target: Math.round(goalKcal * 0.30 / 9), color: 'var(--recovery)' },
    ];

    const handleLogFoodHoy = async (food: any, mealName: string, key: string) => {
        if (loggedHoy.has(key)) return;
        const cal = Math.round(food.calories || 0);
        setLoggedHoy(prev => new Set([...prev, key]));
        setNutrition((prev: any) => ({
            ...prev,
            total_calories: (prev.total_calories || 0) + cal,
            total_protein:  (prev.total_protein  || 0) + (food.protein || 0),
            total_carbs:    (prev.total_carbs    || 0) + (food.carbs   || 0),
            total_fat:      (prev.total_fat      || 0) + (food.fat     || 0),
        }));
        const cache = getNutritionCache() || { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 };
        setNutritionCache({ ...cache,
            total_calories: (cache.total_calories || 0) + cal,
            total_protein:  (cache.total_protein  || 0) + (food.protein || 0),
            total_carbs:    (cache.total_carbs    || 0) + (food.carbs   || 0),
            total_fat:      (cache.total_fat      || 0) + (food.fat     || 0),
        });
        if (user?.id) await logFood(user.id, { food_name: food.name, calories: cal, protein: food.protein || 0, carbs: food.carbs || 0, fat: food.fat || 0, meal_name: mealName }).catch(console.error);
    };

    // Filter by category AND optional caloric range
    const filteredSections = CURATED_SECTIONS.map(s => ({
        ...s, recipes: s.recipes.filter(r => {
            const matchCat = r.categories.includes(activeCategory);
            const matchRange = !selectedRange || (r.kcal >= selectedRange.min && r.kcal < selectedRange.max);
            return matchCat && matchRange;
        }),
    })).filter(s => s.recipes.length > 0);

    // Template image helper
    const getActiveDietImg = (diet: any) => {
        const tmpl = TEMPLATES.find(t => t.id === diet.id);
        if (tmpl) return tmpl.img;
        return getDietImage(diet.name, seedFrom(diet.id || diet.name));
    };

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100dvh', paddingBottom: 90 }}>

            {/* Pro gate modal */}
            {showProGate && (
                <div onClick={() => setShowProGate(false)} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: 'var(--bg)', borderRadius: '24px 24px 0 0', padding: '28px 24px 48px' }}>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
                            <div className="display" style={{ fontSize: 22, color: 'var(--fg)', marginBottom: 8 }}>Función Pro</div>
                            <p style={{ fontSize: 14, color: 'var(--fg-mute)', lineHeight: 1.6, margin: 0 }}>
                                El escáner de comida con IA es exclusivo de Lyfter Pro. Fotografía cualquier plato y obtén sus macros al instante.
                            </p>
                        </div>
                        <Link to="/pro" style={{ textDecoration: 'none', display: 'block' }}>
                            <div style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)', borderRadius: 18, padding: '16px', textAlign: 'center', boxShadow: '0 8px 32px rgba(245,158,11,0.4)' }}>
                                <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>✦ Hazte Pro por 30€/año</div>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>Solo 2,50€ al mes · Sin renovación automática</div>
                            </div>
                        </Link>
                        <button onClick={() => setShowProGate(false)} style={{ width: '100%', marginTop: 12, padding: '13px', borderRadius: 14, background: 'transparent', border: '1px solid var(--line-2)', color: 'var(--fg-mute)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                            Ahora no
                        </button>
                    </div>
                </div>
            )}

            {/* Recipe modal */}
            {selectedRecipe && <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />}

            {showQuiz && <LevelQuizModal type="diet" onClose={() => setShowQuiz(false)} />}

            {/* Header */}
            <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div>
                    <div className="eyebrow">NUTRITION</div>
                    <div className="display" style={{ fontSize: 22, color: 'var(--fg)' }}>Dieta</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setShowQuiz(true)} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: 'var(--card)', color: 'var(--fg)', border: '1px solid var(--line)',
                        borderRadius: 12, padding: '8px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>🎯 ¿Qué plan?</button>
                    <Link to="/diet/create" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: 'var(--accent)', color: 'var(--accent-ink)',
                        borderRadius: 12, padding: '8px 14px', fontSize: 13, fontWeight: 700, textDecoration: 'none',
                    }}>
                        <Plus size={14}/> Nuevo
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ padding: '14px 16px 0' }}>
                <div style={{ display: 'flex', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 4, gap: 4 }}>
                    {(['hoy', 'descubrir', 'planes'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                            background: tab === t ? 'var(--card-2)' : 'transparent',
                            color: tab === t ? 'var(--fg)' : 'var(--fg-mute)',
                            fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
                            borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                        }}>
                            {t === 'hoy' ? 'Hoy' : t === 'descubrir' ? 'Descubrir' : 'Mis planes'}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── TAB: HOY ── */}
            {tab === 'hoy' && (
                <div style={{ padding: '16px 16px 0' }}>
                    {/* Calorie hero card */}
                    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 22, padding: 18 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <CalorieRing pct={pct}/>
                            <div style={{ flex: 1 }}>
                                <div className="eyebrow" style={{ marginBottom: 4 }}>OBJETIVO DIARIO</div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                    <span className="num" style={{ fontSize: 30, fontWeight: 800, color: 'var(--fg)' }}>{consumed}</span>
                                    <span style={{ fontSize: 13, color: 'var(--fg-mute)' }}>/ {goalKcal} kcal</span>
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--fg-mute)', marginTop: 4 }}>
                                    <span style={{ color: 'var(--energy)', fontWeight: 600 }}>{remaining} kcal</span> restantes hoy
                                </div>
                            </div>
                        </div>
                        {/* Macro bars */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 18 }}>
                            {macros.map(m => (
                                <div key={m.name} style={{ background: 'var(--card-2)', borderRadius: 14, padding: '10px 12px' }}>
                                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: m.color, marginBottom: 6 }}>{m.name.toUpperCase()}</div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                                        <span className="num" style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg)' }}>{m.value}</span>
                                        <span style={{ fontSize: 10, color: 'var(--fg-dim)' }}>/{m.target}g</span>
                                    </div>
                                    <div style={{ marginTop: 6 }}>
                                        <Bar pct={m.target > 0 ? m.value / m.target : 0} color={m.color} h={3}/>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active plan meals */}
                    {activeDiet && activeDietMeals.length > 0 && (
                        <div style={{ marginTop: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-mute)', letterSpacing: '0.04em' }}>PLAN DE HOY</div>
                                <Link to={`/diet/${activeDiet.id}`} style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                                    {activeDiet.name} <ChevronRight size={13}/>
                                </Link>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {activeDietMeals.map((meal: any, mIdx: number) => (
                                    <div key={mIdx} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden' }}>
                                        <div style={{ padding: '11px 16px 8px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)' }}>{(meal.name || '').toUpperCase()}</span>
                                            <span style={{ fontSize: 11, color: 'var(--fg-dim)' }}>
                                                {(meal.foods || []).reduce((s: number, f: any) => s + (f.calories || 0), 0)} kcal
                                            </span>
                                        </div>
                                        {(meal.foods || []).map((food: any, fIdx: number) => {
                                            const key = `hoy:${mIdx}:${fIdx}`;
                                            const logged = loggedHoy.has(key);
                                            return (
                                                <div key={fIdx} style={{
                                                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                                                    borderBottom: fIdx < (meal.foods?.length || 0) - 1 ? '1px solid var(--line)' : 'none',
                                                    background: logged ? 'color-mix(in oklch, var(--energy) 7%, transparent)' : 'transparent',
                                                }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: 14, fontWeight: 600, color: logged ? 'var(--fg-dim)' : 'var(--fg)', textDecoration: logged ? 'line-through' : 'none' }}>{food.name}</div>
                                                        <div style={{ display: 'flex', gap: 10, marginTop: 3 }}>
                                                            <span style={{ fontSize: 11, color: 'var(--energy)', display: 'flex', alignItems: 'center', gap: 3 }}><Flame size={10}/>{food.calories} kcal</span>
                                                            {food.protein > 0 && <span style={{ fontSize: 11, color: 'var(--fg-dim)' }}>P: {food.protein}g</span>}
                                                            {food.carbs > 0   && <span style={{ fontSize: 11, color: 'var(--fg-dim)' }}>C: {food.carbs}g</span>}
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleLogFoodHoy(food, meal.name, key)} style={{
                                                        width: 32, height: 32, borderRadius: 10,
                                                        border: `1px solid ${logged ? 'var(--energy)' : 'var(--line-2)'}`,
                                                        background: logged ? 'var(--energy)' : 'transparent',
                                                        color: logged ? '#fff' : 'var(--fg-dim)',
                                                        cursor: logged ? 'default' : 'pointer',
                                                        display: 'grid', placeItems: 'center', flexShrink: 0,
                                                    }}>
                                                        {logged ? <Check size={14}/> : <Plus size={14}/>}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No active plan → CTA */}
                    {!activeDiet && (
                        <div style={{ marginTop: 16 }}>
                            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: '20px 18px', textAlign: 'center' }}>
                                <div style={{ fontSize: 32, marginBottom: 10 }}>🥗</div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', marginBottom: 6 }}>Sin plan activo</div>
                                <div style={{ fontSize: 12, color: 'var(--fg-mute)', marginBottom: 16 }}>Elige un plan para ver tus comidas de hoy aquí</div>
                                <button onClick={() => setTab('descubrir')} style={{
                                    background: 'var(--accent)', color: 'var(--accent-ink)',
                                    border: 'none', borderRadius: 12, padding: '10px 20px',
                                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                }}>Ver planes</button>
                            </div>
                        </div>
                    )}

                    {/* Quick log CTAs */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                        {/* AI scan — Pro gated */}
                        {isPro ? (
                            <Link to="/diet/scan" style={{ textDecoration: 'none', flex: 1 }}>
                                <div style={{ background: 'color-mix(in oklch, var(--accent) 12%, var(--card))', border: '1px solid color-mix(in oklch, var(--accent) 30%, var(--line))', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <ScanLine size={20} color="var(--accent)"/>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)' }}>Escanear</div>
                                        <div style={{ fontSize: 10, color: 'var(--fg-mute)' }}>IA · foto de comida</div>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <button onClick={() => setShowProGate(true)} style={{ flex: 1, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                                <div style={{ background: 'color-mix(in oklch, #f59e0b 10%, var(--card))', border: '1px solid color-mix(in oklch, #f59e0b 30%, var(--line))', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <ScanLine size={20} color="#f59e0b"/>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: 5 }}>Escanear <span style={{ fontSize: 9, background: 'linear-gradient(135deg,#f59e0b,#f97316)', color: '#fff', padding: '2px 6px', borderRadius: 5, fontWeight: 800 }}>PRO</span></div>
                                        <div style={{ fontSize: 10, color: 'var(--fg-mute)' }}>IA · foto de comida</div>
                                    </div>
                                </div>
                            </button>
                        )}
                        {/* Manual log */}
                        <Link to={activeDiet ? `/diet/${activeDiet.id}` : '/diet/create'} style={{ textDecoration: 'none', flex: 1 }}>
                            <div style={{
                                background: 'color-mix(in oklch, var(--energy) 12%, var(--card))',
                                border: '1px solid color-mix(in oklch, var(--energy) 30%, var(--line))',
                                borderRadius: 16, padding: '14px 16px',
                                display: 'flex', alignItems: 'center', gap: 10,
                            }}>
                                <Flame size={20} color="var(--energy)"/>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)' }}>Registrar</div>
                                    <div style={{ fontSize: 10, color: 'var(--fg-mute)' }}>del plan activo</div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            )}

            {/* ── TAB: DESCUBRIR ── */}
            {tab === 'descubrir' && (
                <div>
                    {/* Category chips */}
                    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '16px 16px 0' }} className="no-scrollbar">
                        {CATEGORIES.map(cat => (
                            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
                                flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                background: activeCategory === cat.id ? 'color-mix(in oklch, var(--accent) 14%, var(--card))' : 'var(--card)',
                                border: `1px solid ${activeCategory === cat.id ? 'color-mix(in oklch, var(--accent) 50%, var(--line))' : 'var(--line)'}`,
                                borderRadius: 16, padding: '12px 14px', cursor: 'pointer', minWidth: 68,
                            }}>
                                <span style={{ fontSize: 22 }}>{cat.emoji}</span>
                                <span style={{ fontSize: 10, fontWeight: 600, color: activeCategory === cat.id ? 'var(--accent)' : 'var(--fg-mute)', letterSpacing: '0.02em' }}>{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Caloric ranges */}
                    <div style={{ padding: '20px 16px 0' }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', marginBottom: 12 }}>Por rango calórico</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {CALORIC_RANGES.map(r => {
                                const active = selectedRange?.min === r.min && selectedRange?.max === r.max;
                                return (
                                    <div key={r.label}
                                        onClick={() => setSelectedRange(active ? null : { min: r.min, max: r.max })}
                                        style={{
                                            background: active
                                                ? `color-mix(in oklch, ${r.color} 22%, var(--card))`
                                                : `color-mix(in oklch, ${r.color} 10%, var(--card))`,
                                            border: `1.5px solid color-mix(in oklch, ${r.color} ${active ? 60 : 25}%, var(--line))`,
                                            borderRadius: 18, padding: '18px 16px', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            transform: active ? 'scale(0.97)' : 'scale(1)',
                                            transition: 'all 0.15s',
                                        }}>
                                        <span style={{ fontSize: 28 }}>{r.emoji}</span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: active ? 'var(--fg)' : 'var(--fg)' }}>{r.label}</span>
                                        {active && <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--fg-dim)' }}>✕</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Filtered curated sections */}
                    {filteredSections.length > 0 ? filteredSections.map(section => (
                        <div key={section.title} style={{ padding: '20px 0 0' }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', margin: '0 16px 12px' }}>{section.title}</div>
                            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 16px 4px' }} className="no-scrollbar">
                                {section.recipes.map((recipe, i) => (
                                    <div key={i}
                                        onClick={() => setSelectedRecipe(recipe)}
                                        style={{ flexShrink: 0, width: 165, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden', cursor: 'pointer' }}
                                    >
                                        <div style={{
                                            height: 110,
                                            backgroundImage: `url("${recipe.img}")`,
                                            backgroundSize: 'cover', backgroundPosition: 'center',
                                            position: 'relative',
                                        }}>
                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }}/>
                                            <div style={{ position: 'absolute', bottom: 8, left: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Star size={10} fill="#fff" stroke="#fff"/>
                                                <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>{recipe.rating}</span>
                                            </div>
                                        </div>
                                        <div style={{ padding: '10px 12px' }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', lineHeight: 1.3 }}>{recipe.name}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--energy)' }}>
                                                    <Flame size={11}/>{recipe.kcal} kcal
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--fg-mute)' }}>
                                                    <Clock size={11}/>{recipe.time} min
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--fg-mute)' }}>
                            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', marginBottom: 6 }}>Sin recetas en esta categoría</div>
                            <div style={{ fontSize: 12 }}>Prueba con otra categoría</div>
                        </div>
                    )}

                    {/* Diet plan templates */}
                    <div style={{ padding: '20px 16px 0' }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', marginBottom: 12 }}>Planes completos</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {TEMPLATES.map(t => (
                                <Link key={t.id} to={`/diet/${t.id}`} style={{ textDecoration: 'none' }}>
                                    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden', display: 'flex', alignItems: 'stretch' }}>
                                        <div style={{ width: 120, flexShrink: 0, backgroundImage: `url("${t.img}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}/>
                                        <div style={{ flex: 1, padding: '14px 16px' }}>
                                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)' }}>{t.name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--fg-mute)', marginTop: 4, lineHeight: 1.4 }}>{t.desc}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                                                <Flame size={12} color="var(--energy)"/>
                                                <span className="num" style={{ fontSize: 12, color: 'var(--energy)', fontWeight: 600 }}>{t.kcal} kcal/día</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', paddingRight: 14 }}>
                                            <ChevronRight size={16} color="var(--fg-dim)"/>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAB: MIS PLANES ── */}
            {tab === 'planes' && (
                <div style={{ padding: '16px 16px 0' }}>
                    {/* Template plans always shown */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg-mute)', letterSpacing: '0.06em', marginBottom: 10 }}>PLANES DE LA APP</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {TEMPLATES.map(t => {
                                const isActive = currentDietId === t.id;
                                return (
                                    <Link key={t.id} to={`/diet/${t.id}`} style={{ textDecoration: 'none' }}>
                                        <div style={{
                                            background: 'var(--card)',
                                            border: `1px solid ${isActive ? 'color-mix(in oklch, var(--accent) 45%, var(--line))' : 'var(--line)'}`,
                                            borderRadius: 18, overflow: 'hidden', display: 'flex', alignItems: 'stretch',
                                        }}>
                                            <div style={{ width: 100, flexShrink: 0, backgroundImage: `url("${t.img}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}/>
                                            <div style={{ flex: 1, padding: '12px 14px' }}>
                                                {isActive && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', background: 'var(--accent)', color: 'var(--accent-ink)', padding: '3px 7px', borderRadius: 5, display: 'inline-block', marginBottom: 6 }}>● ACTIVO</span>}
                                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)' }}>{t.name}</div>
                                                <div style={{ fontSize: 11, color: 'var(--fg-mute)', marginTop: 3 }}>{t.desc}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                                                    <Flame size={11} color="var(--energy)"/>
                                                    <span className="num" style={{ fontSize: 11, color: 'var(--energy)', fontWeight: 600 }}>{t.kcal} kcal/día</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', paddingRight: 12 }}>
                                                <ChevronRight size={15} color="var(--fg-dim)"/>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* User's own plans */}
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg-mute)', letterSpacing: '0.06em', marginBottom: 10 }}>MIS PLANES</div>
                        {userDiets.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '32px 20px', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18 }}>
                                <div style={{ fontSize: 36, marginBottom: 12 }}>🥗</div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', marginBottom: 6 }}>Sin planes propios</div>
                                <div style={{ fontSize: 12, color: 'var(--fg-mute)', marginBottom: 18 }}>Crea tu primer plan personalizado</div>
                                <Link to="/diet/create" style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    background: 'var(--accent)', color: 'var(--accent-ink)',
                                    borderRadius: 12, padding: '10px 20px', fontWeight: 700, fontSize: 13, textDecoration: 'none',
                                }}>
                                    <Plus size={14}/> Crear plan
                                </Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {userDiets.map(diet => {
                                    const isActive = currentDietId === diet.id;
                                    return (
                                        <Link key={diet.id} to={`/diet/${diet.id}`} style={{ textDecoration: 'none' }}>
                                            <div style={{
                                                background: 'var(--card)',
                                                border: `1px solid ${isActive ? 'color-mix(in oklch, var(--accent) 35%, var(--line))' : 'var(--line)'}`,
                                                borderRadius: 20, overflow: 'hidden', display: 'flex', alignItems: 'stretch',
                                            }}>
                                                <div style={{
                                                    width: 100, flexShrink: 0,
                                                    backgroundImage: `url("${getActiveDietImg(diet)}")`,
                                                    backgroundSize: 'cover', backgroundPosition: 'center',
                                                }}/>
                                                <div style={{ flex: 1, padding: '12px 14px' }}>
                                                    {isActive && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', background: 'var(--accent)', color: 'var(--accent-ink)', padding: '3px 7px', borderRadius: 5, display: 'inline-block', marginBottom: 6 }}>● ACTIVO</span>}
                                                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)' }}>{diet.name}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--fg-mute)', marginTop: 3 }}>
                                                        {diet.daily_calories_target || diet.total_calories || '—'} kcal · 7 días
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', paddingRight: 12 }}>
                                                    <ChevronRight size={15} color="var(--fg-dim)"/>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
