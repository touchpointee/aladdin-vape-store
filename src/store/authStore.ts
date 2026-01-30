import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCartStore } from './cartStore';

interface User {
    phone: string;
    name?: string;
}

interface AuthState {
    user: User | null;
    isLoggedIn: boolean;
    login: (phone: string) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isLoggedIn: false,
            login: (phone) => set({ user: { phone }, isLoggedIn: true }),
            logout: () => {
                useCartStore.getState().clearCart();
                set({ user: null, isLoggedIn: false });
            },
            updateUser: (updates) => set((state) => ({
                user: state.user ? { ...state.user, ...updates } : null
            })),
        }),
        {
            name: 'vape-auth-storage',
        }
    )
);
