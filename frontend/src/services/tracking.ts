import {
    collection, getDocs, getDoc, doc, addDoc, updateDoc,
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
    let workouts: any[];
    try {
        const snap = await getDocs(query(
            collection(db, 'scheduled_workouts'),
            where('user_id', '==', userId),
            orderBy('created_at', 'desc'),
        ));
        workouts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch {
        // Fallback without orderBy if composite index missing
        const snap = await getDocs(query(
            collection(db, 'scheduled_workouts'),
            where('user_id', '==', userId),
        ));
        workouts = snap.docs
            .map(d => ({ id: d.id, ...d.data() } as any))
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(workouts));
    return workouts;
};

export const getWorkoutById = async (workoutId: string): Promise<any> => {
    const snap = await getDoc(doc(db, 'scheduled_workouts', workoutId));
    if (!snap.exists()) throw new Error('Workout not found');
    return { id: snap.id, ...snap.data() };
};

// kcal per set based on reps + weight (realistic weight training estimate)
export const calcSetKcal = (reps: number, weightKg: number): number =>
    reps * (weightKg * 0.02 + 0.5);

// XP per set based on reps + weight + difficulty
export const calcSetXp = (reps: number, weightKg: number, diffMult: number): number =>
    Math.round((reps * 0.5 + weightKg * 0.1 + 5) * diffMult);

export const logWorkoutSession = async (data: CreateWorkoutLogData, userId: string): Promise<any> => {
    const diffMult = data.difficulty === 'hard' ? 1.5 : data.difficulty === 'easy' ? 1.0 : 1.2;

    // Calculate totals from actual logs (sets × reps × weight)
    let totalKcal = 0;
    let totalXp = 0;
    data.logs.forEach(log => {
        totalKcal += calcSetKcal(log.reps, log.weight_kg);
        totalXp   += calcSetXp(log.reps, log.weight_kg, diffMult);
    });

    // Minimums: showing up always earns something
    totalKcal = Math.max(Math.round(totalKcal), 30);
    totalXp   = Math.max(totalXp, 20);

    // Fetch current user XP/level from Firestore
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    const currentXp = Number(userSnap.data()?.xp ?? 0);
    const newXp = currentXp + totalXp;

    // Level formula: level = floor(√(xp/100)) + 1
    const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
    const prevLevelXp = (newLevel - 1) ** 2 * 100;
    const nextLevelXp = newLevel ** 2 * 100;

    // Update user XP and level in Firestore
    await updateDoc(userRef, { xp: newXp, level: newLevel });

    // Save workout log
    const today = new Date().toISOString().slice(0, 10);
    const ref = await addDoc(collection(db, 'scheduled_workouts'), {
        ...data,
        calories_burned: totalKcal,
        user_id: userId,
        status: 'completed',
        scheduled_date: today,
        created_at: new Date().toISOString(),
    });
    clearHistoryCache();

    return {
        id: ref.id,
        xp_gained:    totalXp,
        new_level:    newLevel,
        new_total_xp: newXp,
        next_level_xp: nextLevelXp,
        prev_level_xp: prevLevelXp,
    };
};
