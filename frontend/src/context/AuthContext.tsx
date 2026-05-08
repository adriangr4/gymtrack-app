import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

interface User {
    id: string;
    username: string;
    email: string;
    profilePicture?: string;
    daily_calorie_goal?: number;
    current_routine_id?: string;
    current_diet_id?: string;
    is_admin?: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {

    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!token) return;
        setIsLoading(true);
        api.get('/users/me')
            .then((res) => {
                const freshUser = res.data;
                const normalizedUser: User = {
                    id: String(freshUser.id),
                    username: freshUser.username,
                    email: freshUser.email,
                    profilePicture: freshUser.profile_picture || freshUser.profilePicture || undefined,
                    current_routine_id: freshUser.current_routine_id || undefined,
                    current_diet_id: freshUser.current_diet_id || undefined,
                    is_admin: freshUser.is_admin || false,
                    daily_calorie_goal: freshUser.daily_calorie_goal || undefined
                };
                setUser(normalizedUser);
                localStorage.setItem('user', JSON.stringify(normalizedUser));
            })
            .catch((err) => {
                if (err.response?.status === 401) {
                    console.warn('Token expirado o inválido. Cerrando sesión.');
                    logout();
                }
            })
            .finally(() => setIsLoading(false));
    }, []);

    const login = (newToken: string, newUser: any) => {

        const normalizedUser: User = {
            id: String(newUser.id),
            username: newUser.username,
            email: newUser.email,
            profilePicture: newUser.profile_picture || newUser.profilePicture || undefined,
            current_routine_id: newUser.current_routine_id || undefined,
            current_diet_id: newUser.current_diet_id || undefined,
            is_admin: newUser.is_admin || false
        };

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        setToken(newToken);
        setUser(normalizedUser);
    };

    const logout = () => {

        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('gymtrack_') || key === 'token' || key === 'user') {
                localStorage.removeItem(key);
            }
        });

        setToken(null);
        setUser(null);
    };

    const updateUser = async (updates: Partial<User>) => {
        if (!user) return;

        const updatedUser = { ...user, ...updates };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);

        try {

            const backendUpdates: any = { ...updates };
            if (updates.profilePicture) {
                backendUpdates.profile_picture = updates.profilePicture;
                delete backendUpdates.profilePicture;
            }

            await api.put('/users/me', backendUpdates);
        } catch (error) {
            console.error("Failed to sync user profile", error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isLoading,
            login,
            logout,
            updateUser,
            isAuthenticated: !!token
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
