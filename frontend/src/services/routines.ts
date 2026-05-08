import api from '../api/client';

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

const CACHE_KEY_ROUTINES = 'gymtrack_routines_list_v4';
const CACHE_PREFIX_DETAILS = 'gymtrack_routine_details_v3_';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

interface CacheItem<T> {
    data: T;
    timestamp: number;
}

export const getFromCache = <T>(key: string): T | null => {
    try {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;

        const item: CacheItem<T> = JSON.parse(itemStr);
        const now = Date.now();

        if (now - item.timestamp > CACHE_EXPIRY_MS) {
            localStorage.removeItem(key);
            return null;
        }

        return item.data;
    } catch (e) {
        console.warn("Error reading from cache", e);
        return null;
    }
};

const saveToCache = <T>(key: string, data: T) => {
    try {
        const item: CacheItem<T> = {
            data,
            timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
        console.warn("Error writing to cache", e);
    }
};

export const clearRoutineCache = () => {
    try {
        localStorage.removeItem(CACHE_KEY_ROUTINES);

        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(CACHE_PREFIX_DETAILS)) {
                localStorage.removeItem(key);
            }
        });
    } catch (e) {
        console.warn("Error clearing cache", e);
    }
};

export const getRoutinesCache = () => getFromCache<Routine[]>(CACHE_KEY_ROUTINES);

export const getRoutines = async (): Promise<Routine[]> => {
    const cached = getRoutinesCache();
    if (cached) return cached;

    const response = await api.get<Routine[]>('/routines/');
    saveToCache(CACHE_KEY_ROUTINES, response.data);
    return response.data;
};

export const getRoutine = async (id: string): Promise<Routine> => {
    const key = `${CACHE_PREFIX_DETAILS}${id}`;
    const cached = getFromCache<Routine>(key);
    if (cached) return cached;

    const response = await api.get<Routine>(`/routines/${id}`);
    saveToCache(key, response.data);
    return response.data;
};

export const createRoutine = async (routine: Routine): Promise<Routine> => {
    const response = await api.post<Routine>('/routines/', routine);
    clearRoutineCache();
    return response.data;
};

export const deleteRoutine = async (id: string): Promise<void> => {
    await api.delete(`/routines/${id}`);
    clearRoutineCache();
};
