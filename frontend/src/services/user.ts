import {
    collection, query, where, getDocs, doc, updateDoc, addDoc,
    orderBy, getDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface DashboardStats {
    calories_burned: number;
    calories_target: number;
    time_minutes: number;
    steps: number;
    mission_name: string;
    mission_duration: number;
    mission_img: string;
    total_workouts: number;
    total_time_minutes: number;
    total_calories_burned: number;
    streak_days: number;
    global_position: number;
    total_users: number;
    level?: number;
    xp?: number;
    rank?: string;
}

const CACHE_KEY = 'gymtrack_dashboard_stats';

export const getDashboardStatsCache = (): DashboardStats | null => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null'); } catch { return null; }
};

export const getDashboardStats = async (userId: string): Promise<DashboardStats> => {
    const today = new Date().toISOString().slice(0, 10);

    // All completed workouts
    const snap = await getDocs(query(
        collection(db, 'scheduled_workouts'),
        where('user_id', '==', userId),
        where('status', '==', 'completed'),
    ));

    let totalWorkouts = 0, totalCal = 0, totalTime = 0;
    const workoutDates = new Set<string>();

    snap.forEach(d => {
        const data = d.data();
        totalWorkouts++;
        totalCal += Number(data.calories_burned ?? 0);
        totalTime += Math.floor((Number(data.duration_seconds ?? 0)) / 60);
        const dt: string = data.scheduled_date ?? data.created_at ?? '';
        if (dt) workoutDates.add(String(dt).slice(0, 10));
    });

    // Streak
    let streakDays = 0;
    let checkDate = new Date();
    for (let i = 0; i < 365; i++) {
        if (workoutDates.has(checkDate.toISOString().slice(0, 10))) {
            streakDays++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else break;
    }

    // Today's calories
    const todaySnap = await getDocs(query(
        collection(db, 'scheduled_workouts'),
        where('user_id', '==', userId),
        where('status', '==', 'completed'),
        where('scheduled_date', '==', today),
    ));
    let calToday = 0, timeToday = 0;
    todaySnap.forEach(d => {
        calToday += Number(d.data().calories_burned ?? 0);
        timeToday += Math.floor((Number(d.data().duration_seconds ?? 0)) / 60);
    });

    // XP & level from user doc
    const userSnap = await getDoc(doc(db, 'users', userId));
    const userData = userSnap.exists() ? userSnap.data() : {};
    const xp = Number(userData?.xp ?? 0);
    const level = Math.floor(Math.sqrt(xp / 100)) + 1;

    // Global ranking
    const allUsersSnap = await getDocs(collection(db, 'users'));
    let totalUsers = 0, usersAhead = 0;
    allUsersSnap.forEach(d => {
        totalUsers++;
        if (Number(d.data().xp ?? 0) > xp) usersAhead++;
    });

    const stats: DashboardStats = {
        calories_burned: calToday,
        calories_target: 600,
        time_minutes: timeToday,
        steps: 0,
        mission_name: 'Entrenamiento del día',
        mission_duration: 45,
        mission_img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',
        total_workouts: totalWorkouts,
        total_time_minutes: totalTime,
        total_calories_burned: totalCal,
        streak_days: streakDays,
        global_position: usersAhead + 1,
        total_users: totalUsers,
        xp,
        level,
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(stats));
    return stats;
};

export const logWeight = async (userId: string, weight: number): Promise<void> => {
    const today = new Date().toISOString().slice(0, 10);
    await addDoc(collection(db, 'weight_logs'), {
        user_id: userId,
        weight,
        date: today,
    });
    await updateDoc(doc(db, 'users', userId), { current_weight: weight });
};

export const getWeightHistory = async (userId: string): Promise<any[]> => {
    const snap = await getDocs(query(
        collection(db, 'weight_logs'),
        where('user_id', '==', userId),
        orderBy('date', 'asc'),
    ));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const setActiveDiet = async (userId: string, dietId: string): Promise<void> => {
    await updateDoc(doc(db, 'users', userId), { current_diet_id: dietId });
};

export const setActiveRoutine = async (userId: string, routineId: string): Promise<void> => {
    await updateDoc(doc(db, 'users', userId), { current_routine_id: routineId });
};
