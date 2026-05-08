import api from '../api/client';

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

export const clearHistoryCache = (): void => {
    localStorage.removeItem(HISTORY_CACHE_KEY);
};

export const getScheduledWorkoutsCache = (): any[] | null => {
    try {
        const cached = localStorage.getItem(HISTORY_CACHE_KEY);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (e) {
        console.warn("Failed to read history cache", e);
    }
    return null;
};

export const getScheduledWorkouts = async (userId?: string): Promise<any[]> => {
    const params: Record<string, string> = {};
    if (userId) params.user_id = userId;
    const response = await api.get('/tracking/', { params });
    try {
        localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(response.data));
    } catch (e) {
        console.warn("Failed to save history cache", e);
    }
    return response.data;
};

export const getWorkoutById = async (workoutId: string) => {
    const response = await api.get(`/tracking/${workoutId}`);
    return response.data;
};

export const logWorkoutSession = async (data: CreateWorkoutLogData) => {
    const response = await api.post('/tracking/log-session', data);
    return response.data;
};
