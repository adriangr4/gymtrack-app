import {
    collection, getDocs, getDoc, doc, addDoc,
    query, where, writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface RoutineExercise {
    exercise_id: string;
    name?: string;
    series: number;
    reps: string;
}

export interface DailyRoutine {
    day: string;
    exercises: RoutineExercise[];
}

export interface Routine {
    id?: string;
    name: string;
    description?: string;
    is_public?: boolean;
    is_predefined?: boolean;
    difficulty?: string;
    days_per_week?: number;
    daily_calories_target?: number;
    weekly_plan?: DailyRoutine[];
    exercises?: any[];
    average_rating?: number;
    creator_id?: string;
}

const CACHE_KEY = 'gymtrack_routines_list_v4';
const DETAIL_PREFIX = 'gymtrack_routine_details_v3_';
const TTL = 24 * 60 * 60 * 1000;

const fromCache = <T>(key: string): T | null => {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const { data, ts } = JSON.parse(raw);
        if (Date.now() - ts > TTL) { localStorage.removeItem(key); return null; }
        return data as T;
    } catch { return null; }
};
const toCache = <T>(key: string, data: T) => {
    try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch {}
};

export const clearRoutineCache = () => {
    localStorage.removeItem(CACHE_KEY);
    Object.keys(localStorage).filter(k => k.startsWith(DETAIL_PREFIX)).forEach(k => localStorage.removeItem(k));
};

export const getRoutinesCache = () => fromCache<Routine[]>(CACHE_KEY);

async function attachExercises(routineId: string): Promise<any[]> {
    const snap = await getDocs(query(
        collection(db, 'routine_exercises'),
        where('routine_id', '==', routineId),
    ));
    const exIds = new Set<string>();
    const rows = snap.docs.map(d => { const r = { id: d.id, ...d.data() }; exIds.add((r as any).exercise_id); return r; });

    const exMap: Record<string, any> = {};
    await Promise.all([...exIds].map(async id => {
        const s = await getDoc(doc(db, 'exercises', id));
        if (s.exists()) exMap[id] = { id: s.id, ...s.data() };
    }));

    return rows.map(r => ({ ...r, exercise: exMap[(r as any).exercise_id] ?? null }));
}

export const getRoutines = async (userId: string): Promise<Routine[]> => {
    const cached = fromCache<Routine[]>(CACHE_KEY);
    if (cached) return cached;

    // user routines + system routines
    const [userSnap, sysSnap] = await Promise.all([
        getDocs(query(collection(db, 'routines'), where('creator_id', '==', userId))),
        getDocs(query(collection(db, 'routines'), where('creator_id', '==', 'system'))),
    ]);

    const docsMap = new Map<string, any>();
    [...sysSnap.docs, ...userSnap.docs].forEach(d => docsMap.set(d.id, { id: d.id, ...d.data() }));

    const routines = await Promise.all([...docsMap.values()].map(async r => ({
        ...r,
        exercises: await attachExercises(r.id),
    })));

    toCache(CACHE_KEY, routines);
    return routines;
};

export const getRoutine = async (id: string): Promise<Routine> => {
    const cached = fromCache<Routine>(`${DETAIL_PREFIX}${id}`);
    if (cached) return cached;

    const snap = await getDoc(doc(db, 'routines', id));
    if (!snap.exists()) throw new Error('Routine not found');
    const routine = { id: snap.id, ...snap.data(), exercises: await attachExercises(id) } as Routine;
    toCache(`${DETAIL_PREFIX}${id}`, routine);
    return routine;
};

export const createRoutine = async (routine: Routine, userId: string): Promise<Routine> => {
    const { weekly_plan, ...rest } = routine;
    const ref = await addDoc(collection(db, 'routines'), {
        ...rest,
        creator_id: userId,
        is_public: rest.is_public ?? false,
        average_rating: 0,
        rating_count: 0,
        created_at: new Date().toISOString(),
    });

    const dayMap: Record<string, number> = {
        Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4,
        Friday: 5, Saturday: 6, Sunday: 7,
    };

    if (weekly_plan?.length) {
        const batch = writeBatch(db);
        weekly_plan.forEach(day => {
            day.exercises.forEach((ex, idx) => {
                const repsStr = String(ex.reps ?? '0');
                const parts = repsStr.split('-');
                const newRef = doc(collection(db, 'routine_exercises'));
                batch.set(newRef, {
                    routine_id: ref.id,
                    exercise_id: ex.exercise_id,
                    day_of_week: dayMap[day.day] ?? 1,
                    order_index: idx,
                    target_sets: ex.series,
                    target_reps_min: Number(parts[0]) || 0,
                    target_reps_max: parts[1] ? Number(parts[1]) : null,
                    reps_display: repsStr,
                });
            });
        });
        await batch.commit();
    }

    clearRoutineCache();
    return getRoutine(ref.id);
};

export const deleteRoutine = async (id: string): Promise<void> => {
    const exSnap = await getDocs(query(collection(db, 'routine_exercises'), where('routine_id', '==', id)));
    const batch = writeBatch(db);
    exSnap.docs.forEach(d => batch.delete(d.ref));
    batch.delete(doc(db, 'routines', id));
    await batch.commit();
    clearRoutineCache();
};
