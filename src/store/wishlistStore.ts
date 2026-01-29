import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistStore {
    items: string[]; // Product IDs
    addItem: (id: string) => void;
    removeItem: (id: string) => void;
    hasItem: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (id) => {
                const current = get().items;
                if (!current.includes(id)) {
                    set({ items: [...current, id] });
                }
            },
            removeItem: (id) => set({ items: get().items.filter((i) => i !== id) }),
            hasItem: (id) => get().items.includes(id),
        }),
        { name: 'wishlist-storage' }
    )
);
