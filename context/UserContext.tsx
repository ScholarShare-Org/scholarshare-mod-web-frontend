'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ModeratorProfile } from '@/types';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface UserContextType {
    user: ModeratorProfile | null;
    loading: boolean;
    error: string | null;
    refetchUser: () => Promise<void>;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<ModeratorProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchUser = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                // Optimization: If no token, don't even try, easier to handle in layout protection
                setLoading(false);
                return;
            }
            const res = await api.get('/moderator/profile');
            setUser(res.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch user profile:", err);
            setError("Failed to load user profile");
            // If 401, the interceptor in api.ts usually handles redirect, but we can double safe here
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const logout = () => {
        localStorage.removeItem('access_token');
        setUser(null);
        router.push('/login');
    };

    return (
        <UserContext.Provider value={{ user, loading, error, refetchUser: fetchUser, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
