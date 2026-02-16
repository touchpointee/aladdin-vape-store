import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from './storage';
import type { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (uniqueKey: string) => void;
  updateQuantity: (uniqueKey: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
  syncCartWithServer: (products: any[]) => void;
}

const uniqueKey = (item: CartItem) =>
  `${item.id}-${item.selectedFlavour || 'none'}-${item.selectedNicotine || 'none'}`;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (item) => {
        const currentItems = get().items;
        const key = uniqueKey(item);
        const existing = currentItems.find((i) => uniqueKey(i) === key);
        if (existing) {
          set({
            items: currentItems.map((i) =>
              uniqueKey(i) === key ? { ...i, ...item, quantity: i.quantity + item.quantity } : i
            ),
            isOpen: true,
          });
        } else {
          set({ items: [...currentItems, item], isOpen: true });
        }
      },
      removeItem: (key) =>
        set({ items: get().items.filter((i) => uniqueKey(i) !== key) }),
      updateQuantity: (key, quantity) =>
        set({
          items: get().items.map((i) =>
            uniqueKey(i) === key ? { ...i, quantity: Math.max(1, quantity) } : i
          ),
        }),
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      subtotal: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
      syncCartWithServer: (serverProducts: any[]) => {
        const list = Array.isArray(serverProducts) ? serverProducts : (serverProducts?.products || []);
        if (list.length === 0) return;
        const currentItems = get().items;
        const updated = currentItems.map((item) => {
          const p = list.find((x: any) => x._id === item.id);
          if (!p) return item;
          let basePrice = p.price || 0;
          let discountedPrice =
            p.discountPrice && p.discountPrice < basePrice
              ? p.discountPrice
              : p.discountPercent
                ? basePrice - (basePrice * p.discountPercent) / 100
                : p.discountPrice || basePrice;
          if (item.selectedNicotine && p.variants?.length) {
            const v = p.variants.find((x: any) => x.nicotine === item.selectedNicotine);
            if (v) {
              basePrice = v.price;
              discountedPrice = v.discountPrice && v.discountPrice < v.price ? v.discountPrice : v.price;
            }
          }
          return {
            ...item,
            price: discountedPrice,
            name: p.name,
            image: p.images?.[0] || item.image,
            puffCount: p.puffCount,
            capacity: p.capacity,
            resistance: p.resistance,
            originalPrice: discountedPrice < basePrice ? basePrice : undefined,
          };
        });
        set({ items: updated });
      },
    }),
    { name: 'vape-cart-storage', storage: createJSONStorage(() => storage) }
  )
);
