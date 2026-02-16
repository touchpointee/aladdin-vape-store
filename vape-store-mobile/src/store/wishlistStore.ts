import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from './storage';

interface WishlistStore {
  items: string[];
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  hasItem: (id: string) => boolean;
  syncItems: (validIds: string[]) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (id) => {
        const current = get().items;
        if (!current.includes(id)) set({ items: [...current, id] });
      },
      removeItem: (id) => set({ items: get().items.filter((i) => i !== id) }),
      hasItem: (id) => get().items.includes(id),
      syncItems: (validIds) => {
        const current = get().items;
        const filtered = current.filter((id) => validIds.includes(id));
        if (filtered.length !== current.length) set({ items: filtered });
      },
    }),
    { name: 'wishlist-storage', storage: createJSONStorage(() => storage) }
  )
);
