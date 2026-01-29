import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string; // Product ID
    name: string;
    price: number;
    image: string;
    quantity: number;
    puffCount?: number;
    capacity?: string;
    resistance?: string;
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: () => number;
    subtotal: () => number;
    syncCartWithServer: (products: any[]) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
            addItem: (item) => {
                const currentItems = get().items;
                const existingItem = currentItems.find((i) => i.id === item.id);

                if (existingItem) {
                    set({
                        items: currentItems.map((i) =>
                            i.id === item.id
                                ? { ...i, ...item, quantity: i.quantity + item.quantity } // Update item details (price) and sum quantity
                                : i
                        ),
                        isOpen: true,
                    });
                } else {
                    set({ items: [...currentItems, item], isOpen: true });
                }
            },
            removeItem: (id) =>
                set({ items: get().items.filter((i) => i.id !== id) }),
            updateQuantity: (id, quantity) =>
                set({
                    items: get().items.map((i) =>
                        i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
                    ),
                }),
            clearCart: () => set({ items: [] }),
            totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
            syncCartWithServer: (serverProducts: any[]) => {
                const currentItems = get().items;
                const updatedItems = currentItems.map(item => {
                    const serverProduct = serverProducts.find(p => p._id === item.id);
                    if (!serverProduct) return item; // Keep as is if not found (or remove?)

                    // Calculate effective price (handle discount)
                    const discountedPrice = (serverProduct.discountPrice && serverProduct.discountPrice < serverProduct.price)
                        ? serverProduct.discountPrice
                        : (serverProduct.discountPercent
                            ? (serverProduct.price - (serverProduct.price * serverProduct.discountPercent / 100))
                            : serverProduct.price);

                    return {
                        ...item,
                        price: discountedPrice,
                        name: serverProduct.name, // Update name just in case
                        image: serverProduct.images?.[0] || item.image,
                        puffCount: serverProduct.puffCount,
                        capacity: serverProduct.capacity,
                        resistance: serverProduct.resistance
                    };
                });

                // Only update if changes detected (shallow comparison is hard, just set)
                set({ items: updatedItems });
            },
            subtotal: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
        }),
        {
            name: 'vape-cart-storage',
        }
    )
);
