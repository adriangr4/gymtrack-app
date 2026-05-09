import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

const CACHE_KEY = 'gymtrack_nutrition_today';

export const getNutritionCache = (): any | null => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null'); } catch { return null; }
};
export const setNutritionCache = (data: any) => {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
};

export const getNutritionToday = async (userId: string): Promise<any> => {
    const today = new Date().toISOString().slice(0, 10);
    const snap = await getDocs(query(
        collection(db, 'nutrition_logs'),
        where('user_id', '==', userId),
        where('date', '==', today),
    ));
    let calories = 0, protein = 0, carbs = 0, fat = 0;
    snap.forEach(d => {
        const data = d.data();
        calories += Number(data.calories ?? 0);
        protein  += Number(data.protein  ?? 0);
        carbs    += Number(data.carbs    ?? 0);
        fat      += Number(data.fat      ?? 0);
    });
    return { total_calories: calories, total_protein: protein, total_carbs: carbs, total_fat: fat, goal_calories: 2400 };
};

export const logFood = async (userId: string, food: {
    food_name: string; calories: number; protein: number; carbs: number; fat: number;
    meal_name?: string; diet_id?: string;
}): Promise<void> => {
    const today = new Date().toISOString().slice(0, 10);
    await addDoc(collection(db, 'nutrition_logs'), {
        ...food,
        user_id: userId,
        date: today,
        logged_at: new Date().toISOString(),
    });
    localStorage.removeItem(CACHE_KEY);
};
