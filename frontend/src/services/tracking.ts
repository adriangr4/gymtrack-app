import {
    collection, getDocs, getDoc, doc, addDoc,
    query, where, orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface CreateWorkoutLogData {
    routine_id: string;
    duration_seconds: number;
    calories_burned: number;
    rating: number;
    difficulty: 'easy' | 'medium' | 'hard';
    notes?: string;
    logs: Array<{
        exercise_id: string;
        set_number: number;
        reps: number;
        weight_kg: number;
        notes?: string;
    }>;
}

const HISTORY_CACHE_KEY = 'gymtrack_history_list';

export const clearHistoryCache = () => localStorage.removeItem(HISTORY_CACHE_KEY);

export const getScheduledWorkoutsCache = (): any[] | null => {
    try { return JSON.parse(localStorage.getItem(HISTORY_CACHE_KEY) ?? 'null'); } catch { return null; }
};

export const getScheduledWorkouts = async (userId?: string): Promise<any[]> => {
    if (!userId) return [];
    const snap = await getDocs(query(
        collection(db, 'scheduled_workouts'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc'),
    ));
    const workouts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(workouts));
    return workouts;
};

export const getWorkoutById = async (workoutId: string): Promise<any> => {
    const snap = await getDoc(doc(db, 'scheduled_workouts', workoutId));
    if (!snap.exists()) throw new Error('Workout not found');
    return { id: snap.id, ...snap.data() };
};

export const logWorkoutSession = async (data: CreateWorkoutLogData, userId: string): Promise<any> => {
    const today = new Date().toISOString().slice(0, 10);
    const ref = await addDoc(collection(db, 'scheduled_workouts'), {
        ...data,
        user_id: userId,
        status: 'completed',
        scheduled_date: today,
        created_at: new Date().toISOString(),
    });
    clearHistoryCache();
    return { id: ref.id, ...data };
};
