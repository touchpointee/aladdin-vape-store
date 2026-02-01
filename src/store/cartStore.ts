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
    originalPrice?: number;
    selectedFlavour?: string;
    selectedNicotine?: string;
}

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

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
            addItem: (item) => {
                const currentItems = get().items;
                const uniqueKey = `${item.id}-${item.selectedFlavour || 'none'}-${item.selectedNicotine || 'none'}`;
                const existingItem = currentItems.find((i) =>
                    `${i.id}-${i.selectedFlavour || 'none'}-${i.selectedNicotine || 'none'}` === uniqueKey
                );

                if (existingItem) {
                    set({
                        items: currentItems.map((i) =>
                            `${i.id}-${i.selectedFlavour || 'none'}-${i.selectedNicotine || 'none'}` === uniqueKey
                                ? { ...i, ...item, quantity: i.quantity + item.quantity }
                                : i
                        ),
                        isOpen: true,
                    });
                } else {
                    set({ items: [...currentItems, item], isOpen: true });
                }
            },
            removeItem: (uniqueKey) =>
                set({
                    items: get().items.filter((i) =>
                        `${i.id}-${i.selectedFlavour || 'none'}-${i.selectedNicotine || 'none'}` !== uniqueKey
                    )
                }),
            updateQuantity: (uniqueKey, quantity) =>
                set({
                    items: get().items.map((i) =>
                        `${i.id}-${i.selectedFlavour || 'none'}-${i.selectedNicotine || 'none'}` === uniqueKey
                            ? { ...i, quantity: Math.max(1, quantity) }
                            : i
                    ),
                }),
            clearCart: () => set({ items: [] }),
            totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
            syncCartWithServer: (data: any) => {
                let serverProducts: any[] = [];
                if (Array.isArray(data)) {
                    serverProducts = data;
                } else if (data && Array.isArray(data.products)) {
                    serverProducts = data.products;
                }

                if (serverProducts.length === 0) return;

                const currentItems = get().items;
                const updatedItems = currentItems.map(item => {
                    const serverProduct = serverProducts.find((p: any) => p._id === item.id);
                    if (!serverProduct) return item;

                    // Calculate effective price (handle variants first)
                    let basePrice = serverProduct.price || 0;
                    let discountedPrice = (serverProduct.discountPrice && serverProduct.discountPrice < basePrice)
                        ? serverProduct.discountPrice
                        : (serverProduct.discountPercent
                            ? (basePrice - (basePrice * serverProduct.discountPercent / 100))
                            : (serverProduct.discountPrice || basePrice));

                    if (item.selectedNicotine && serverProduct.variants?.length > 0) {
                        const variant = serverProduct.variants.find((v: any) => v.nicotine === item.selectedNicotine);
                        if (variant) {
                            basePrice = variant.price;
                            discountedPrice = (variant.discountPrice && variant.discountPrice < variant.price)
                                ? variant.discountPrice
                                : variant.price;
                        }
                    }

                    return {
                        ...item,
                        price: discountedPrice,
                        name: serverProduct.name,
                        image: serverProduct.images?.[0] || item.image,
                        puffCount: serverProduct.puffCount,
                        capacity: serverProduct.capacity,
                        resistance: serverProduct.resistance,
                        originalPrice: (discountedPrice < basePrice) ? basePrice : undefined
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
