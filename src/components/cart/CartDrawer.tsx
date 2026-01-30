"use client";

import { useCartStore } from "@/store/cartStore";
import { X, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function CartDrawer() {
    const { isOpen, closeCart, items, removeItem, updateQuantity, subtotal } = useCartStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (items.length > 0 && isOpen) {
            const ids = items.map(i => i.id).join(',');
            fetch(`/api/products?ids=${ids}`)
                .then(res => res.json())
                .then(data => {
                    useCartStore.getState().syncCartWithServer(data);
                })
                .catch(err => console.error("Failed to sync cart", err));
        }
    }, [isOpen]);

    if (!mounted) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/50 z-50 transition-opacity duration-300",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={closeCart}
            />

            {/* Drawer */}
            <div
                className={cn(
                    "fixed inset-y-0 right-0 w-full max-w-sm bg-white z-[60] shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">SHOPPING CART</h2>
                        <p className="text-xs text-gray-500 uppercase">{items.length} ITEM{items.length !== 1 ? 'S' : ''}</p>
                    </div>
                    <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Scrollable Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {items.length === 0 ? (
                        <div className="text-center text-gray-500 mt-10">Your cart is empty</div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4">
                                {/* Image */}
                                <div className="w-20 h-20 relative border rounded-md overflow-hidden shrink-0">
                                    <Image
                                        src={item.image || "/placeholder.png"}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2">{item.name}</h3>
                                    <div className="flex justify-between items-center mt-2">
                                        {/* Quantity */}
                                        <div className="flex items-center border border-gray-200 rounded-sm">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Price */}
                                        <div className="text-blue-500 font-bold text-sm">
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                    {/* Delete */}
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="self-start mt-2 text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="border-t bg-white p-4 space-y-4 pb-8">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">SUBTOTAL:</span>
                        <span className="text-lg font-bold text-gray-900">₹{subtotal().toFixed(2)}</span>
                    </div>



                    <div className="grid grid-cols-1 gap-3">
                        <Link href="/checkout" onClick={closeCart} className="block w-full">
                            <button className="w-full py-3 bg-blue-500 text-white font-bold text-sm uppercase tracking-wide hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200">
                                CHECK OUT
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
