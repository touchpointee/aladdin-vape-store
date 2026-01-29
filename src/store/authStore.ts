import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    phone: string;
    name?: string;
}

interface AuthState {
    user: User | null;
    isLoggedIn: boolean;
    login: (phone: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isLoggedIn: false,
            login: (phone) => set({ user: { phone }, isLoggedIn: true }),
            logout: () => set({ user: null, isLoggedIn: false }),
        }),
        {
            name: 'vape-auth-storage',
        }
    )
);
