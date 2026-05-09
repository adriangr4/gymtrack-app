import {
    collection, getDocs, getDoc, doc, addDoc, deleteDoc,
    query, where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Diet {
    id: string;
    name: string;
    description?: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    image_url?: string;
    meals?: any[];
    user_id?: string;
    daily_calories_target?: number;
    total_calories?: number;
    weekly_plan?: any[];
    creator_id?: string;
}

const CACHE_KEY = 'gymtrack_diets_list_v3';

export const getDietsCache = (): Diet[] | null => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null'); } catch { return null; }
};

export const clearDietsCache = () => localStorage.removeItem(CACHE_KEY);

export const getDiets = async (userId: string): Promise<Diet[]> => {
    const snap = await getDocs(query(
        collection(db, 'diets'),
        where('user_id', '==', userId),
    ));
    const diets = snap.docs.map(d => ({ id: d.id, ...d.data() } as Diet));
    localStorage.setItem(CACHE_KEY, JSON.stringify(diets));
    return diets;
};

export const getDiet = async (id: string): Promise<Diet> => {
    const snap = await getDoc(doc(db, 'diets', id));
    if (!snap.exists()) throw new Error('Diet not found');
    return { id: snap.id, ...snap.data() } as Diet;
};

export const createDiet = async (diet: Omit<Diet, 'id'>, userId: string): Promise<Diet> => {
    const ref = await addDoc(collection(db, 'diets'), {
        ...diet,
        user_id: userId,
        creator_id: userId,
        created_at: new Date().toISOString(),
    });
    clearDietsCache();
    return { id: ref.id, ...diet };
};

export const deleteDiet = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'diets', id));
    clearDietsCache();
};
