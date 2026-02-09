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
        <div className="bg-gray-50 min-h-screen pb-24 md:pb-8">
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Link href="/">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">My Wishlist</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                    {loading ? (
                        <div className="col-span-full text-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading your wishlist...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
                            <Heart size={64} className="mx-auto mb-4 text-gray-200" />
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                            <p className="mb-6">Save items you love to find them later.</p>
                            <Link href="/" className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors inline-block">
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        products.map((product) => (
                            <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative group hover:shadow-md transition-shadow">
                                <Link href={`/product/${product.slug || product._id}`} className="absolute inset-0 z-10">
                                    <span className="sr-only">View Product</span>
                                </Link>

                                <div className="relative aspect-square p-2 bg-gray-50/50">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            removeItem(product._id);
                                        }}
                                        className="absolute top-2 right-2 bg-white/90 p-2 rounded-full z-30 text-red-500 hover:bg-red-50 transition-colors pointer-events-auto cursor-pointer border border-gray-100 shadow-sm"
                                        title="Remove from wishlist"
                                    >
                                        <Heart size={18} fill="currentColor" />
                                    </button>
                                    <Image
                                        src={product.images?.[0] || '/placeholder.png'}
                                        alt={product.name}
                                        fill
                                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 768px) 50vw, 16vw"
                                        unoptimized
                                    />
                                </div>
                                <div className="p-3 md:p-4 flex flex-col flex-1 relative z-20">
                                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 md:h-10 mb-2">{product.name}</h3>

                                    {/* Price Display */}
                                    <div className="mb-4">
                                        {(product.discountPrice && product.discountPrice < product.price) ? (
                                            <div className="flex flex-wrap items-center gap-x-2">
                                                <span className="text-base font-bold text-red-600">₹{product.discountPrice}</span>
                                                <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                                                <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-bold">
                                                    -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                                                </span>
                                            </div>
                                        ) : (
                                            <p className="text-base font-bold text-gray-900">₹{product.price}</p>
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
                                        className="mt-auto w-full py-2.5 bg-gray-900 text-white text-xs font-bold uppercase rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 pointer-events-auto cursor-pointer relative z-30"
                                    >
                                        <ShoppingBag size={14} /> Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
