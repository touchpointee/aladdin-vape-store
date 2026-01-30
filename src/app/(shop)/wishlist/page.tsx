"use client";

import { useWishlistStore } from "@/store/wishlistStore";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";

export default function WishlistPage() {
    const { items, removeItem } = useWishlistStore();
    const { addItem } = useCartStore();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (items.length === 0) {
            setProducts([]);
            setLoading(false);
            return;
        }

        // Fetch products
        fetch(`/api/products?ids=${items.join(',')}`)
            .then(res => res.json())
            .then(data => {
                // Handle both old array structure and new paginated object structure
                const fetchedProducts = Array.isArray(data) ? data : (data.products || []);
                setProducts(fetchedProducts);

                // Sync store with actual products found on server
                const validIds = fetchedProducts.map((p: any) => p._id);
                useWishlistStore.getState().syncItems(validIds);

                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [items]);

    return (
        <div className="bg-gray-50 min-h-screen pb-safe">
            <div className="bg-white p-4 flex items-center gap-4 border-b sticky top-0 z-10">
                <Link href="/">
                    <ArrowLeft size={24} className="text-gray-600" />
                </Link>
                <h1 className="text-lg font-bold text-gray-900">My Wishlist</h1>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4">
                {loading ? (
                    <div className="col-span-2 text-center py-10">Loading...</div>
                ) : products.length === 0 ? (
                    <div className="col-span-2 text-center py-20 text-gray-500">
                        <Heart size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Your wishlist is empty.</p>
                        <Link href="/" className="text-blue-600 font-bold mt-2 inline-block">Start Shopping</Link>
                    </div>
                ) : (
                    products.map((product) => (
                        <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative group">
                            <Link href={`/product/${product._id}`} className="absolute inset-0 z-10">
                                <span className="sr-only">View Product</span>
                            </Link>

                            <div className="relative aspect-square p-4 pointer-events-none">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeItem(product._id);
                                    }}
                                    className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full z-30 text-red-500 pointer-events-auto cursor-pointer border border-gray-100 shadow-sm"
                                >
                                    <Heart size={16} fill="currentColor" />
                                </button>
                                <Image
                                    src={product.images?.[0] || '/placeholder.png'}
                                    alt={product.name}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div className="p-3 flex flex-col flex-1 pointer-events-none relative z-20">
                                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">{product.name}</h3>

                                {/* Price Display */}
                                <div className="mb-3">
                                    {(product.discountPrice && product.discountPrice < product.price) ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-red-500">INR {product.discountPrice}</span>
                                            <span className="text-xs text-gray-400 line-through">INR {product.price}</span>
                                            <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">
                                                -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="text-sm font-bold text-gray-900">INR {product.price}</p>
                                    )}
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const finalPrice = (product.discountPrice && product.discountPrice < product.price)
                                            ? product.discountPrice
                                            : product.price;

                                        addItem({
                                            id: product._id,
                                            name: product.name,
                                            price: finalPrice,
                                            image: product.images?.[0],
                                            quantity: 1,
                                            puffCount: product.puffCount,
                                            capacity: product.capacity,
                                            resistance: product.resistance
                                        });
                                    }}
                                    className="mt-auto w-full py-2 bg-blue-100 text-blue-700 text-xs font-bold uppercase rounded hover:bg-blue-200 flex items-center justify-center gap-2 pointer-events-auto cursor-pointer relative z-30"
                                >
                                    <ShoppingBag size={14} /> Add to Cart
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
