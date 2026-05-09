import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface User {
    id: string;
    username: string;
    email: string;
    profilePicture?: string;
    daily_calorie_goal?: number;
    current_routine_id?: string;
    current_diet_id?: string;
    is_admin?: boolean;
    is_pro?: boolean;
    xp?: number;
    level?: number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (updates: Partial<User>) => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchUserDoc(uid: string): Promise<User | null> {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
        id: uid,
        username: d.username ?? '',
        email: d.email ?? '',
        profilePicture: d.profile_picture ?? d.profilePicture ?? undefined,
        daily_calorie_goal: d.daily_calorie_goal ?? undefined,
        current_routine_id: d.current_routine_id ?? undefined,
        current_diet_id: d.current_diet_id ?? undefined,
        is_admin: d.is_admin ?? false,
        is_pro: d.is_pro ?? false,
        xp: d.xp ?? 0,
        level: d.level ?? 1,
    };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        try { return JSON.parse(localStorage.getItem('user') ?? 'null'); } catch { return null; }
    });
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
            if (fbUser) {
                const t = await fbUser.getIdToken();
                setToken(t);
                const profile = await fetchUserDoc(fbUser.uid);
                if (profile) {
                    setUser(profile);
                    localStorage.setItem('user', JSON.stringify(profile));
                }
            } else {
                setToken(null);
                setUser(null);
                localStorage.removeItem('user');
            }
            setIsLoading(false);
        });
        return unsub;
    }, []);

    const login = async (email: string, password: string) => {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const profile = await fetchUserDoc(cred.user.uid);
        if (profile) {
            setUser(profile);
            localStorage.setItem('user', JSON.stringify(profile));
        }
    };

    const register = async (username: string, email: string, password: string) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const newUser: User = {
            id: cred.user.uid,
            username,
            email,
            xp: 0,
            level: 1,
            is_admin: false,
        };
        await setDoc(doc(db, 'users', cred.user.uid), {
            username,
            email,
            xp: 0,
            level: 1,
            is_admin: false,
            created_at: new Date().toISOString(),
        });
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = async () => {
        await signOut(auth);
        Object.keys(localStorage).forEach(k => {
            if (k.startsWith('gymtrack_') || k === 'user') localStorage.removeItem(k);
        });
        setUser(null);
        setToken(null);
    };

    const updateUser = async (updates: Partial<User>) => {
        if (!user) return;
        const merged = { ...user, ...updates };
        setUser(merged);
        localStorage.setItem('user', JSON.stringify(merged));
        try {
            const fsUpdates: Record<string, unknown> = { ...updates };
            if (updates.profilePicture) {
                fsUpdates.profile_picture = updates.profilePicture;
                delete fsUpdates.profilePicture;
            }
            await updateDoc(doc(db, 'users', user.id), fsUpdates);
        } catch (e) {
            console.error('Failed to sync user', e);
        }
    };

    return (
        <AuthContext.Provider value={{
            user, token, isLoading,
            login, register, logout, updateUser,
            isAuthenticated: !!user,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
