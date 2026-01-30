import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Search, Star, ShoppingBag } from "lucide-react";
import { IProduct } from "@/models/all";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

interface ProductCardProps {
    product: Partial<IProduct> & { _id: string };
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCartStore();
    const { hasItem, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

    // Hydration fix: only check store after mount
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const isWishlisted = mounted ? hasItem(product._id) : false;

    const toggleWishlist = () => {
        if (isWishlisted) {
            removeFromWishlist(product._id);
        } else {
            addToWishlist(product._id);
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group">
            {/* Full Card Link */}
            <Link href={`/product/${product.slug || product._id}`} className="absolute inset-0 z-10">
                <span className="sr-only">View Product</span>
            </Link>

            {/* Badges - Left */}
            <div className="absolute top-2 left-0 z-20 flex flex-col items-start gap-1 pointer-events-none">
                {product.isHot && (
                    <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-r-md uppercase">
                        Hot
                    </span>
                )}
                {(product.discountPrice && product.discountPrice < product.price!) && (
                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-r-md">
                        -{Math.round(((product.price! - product.discountPrice) / product.price!) * 100)}%
                    </span>
                )}
            </div>

            {/* Icons - Right */}
            <div className="absolute top-2 right-2 z-30 flex flex-col gap-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent navigation when clicking heart
                        e.preventDefault();
                        toggleWishlist();
                    }}
                    className="bg-white p-1.5 rounded-full shadow-sm hover:text-red-500 transition-colors cursor-pointer"
                >
                    <Heart size={14} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
                </button>
                {/* 
                   Optional: Keep the search icon if it does something else (like a modal). 
                   If it just goes to the page, it's redundant now, but I'll keep it as a 'quick view' visual 
                */}
                <Link href={`/product/${product.slug || product._id}`} className="bg-white p-1.5 rounded-full shadow-sm hover:text-blue-500 transition-colors relative z-20">
                    <Search size={14} />
                </Link>
            </div>

            {/* Product Image */}
            <div className="relative w-full aspect-square bg-gray-50 p-4 pointer-events-none">
                <Image
                    src={product.images?.[0] || "/product-placeholder.png"}
                    alt={product.name ? `Buy ${product.name} - Online Vape Store India` : "Premium Vape Product"}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                />
            </div>

            {/* Details */}
            <div className="p-3 relative z-10 pointer-events-none">
                {/* Price */}
                <div className="flex items-center gap-2 mb-1">
                    {product.discountPrice && product.discountPrice < product.price! ? (
                        <>
                            <span className="text-xs text-gray-400 line-through">INR {product.price}</span>
                            <span className="text-sm font-bold text-red-500">
                                INR {product.discountPrice}
                            </span>
                        </>
                    ) : (
                        <span className="text-sm font-bold text-gray-900">INR {product.price}</span>
                    )}
                </div>

                {/* Name */}
                <h3 className="text-xs font-semibold text-gray-800 leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                </h3>

                {/* Puff Count */}
                {product.puffCount && (
                    <div className="text-[10px] text-gray-500 mb-2">
                        {product.puffCount} Puffs
                    </div>
                )}
                {product.capacity && (
                    <div className="text-[10px] text-gray-500 mb-2">
                        {product.capacity}
                    </div>
                )}
                {product.resistance && (
                    <div className="text-[10px] text-gray-500 mb-2">
                        {product.resistance}
                    </div>
                )}

                {/* Rating */}
                <div className="flex gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            size={10}
                            className={`${star <= (product.rating || 5) ? "fill-gray-300 text-gray-300" : "text-gray-200"}`}
                        />
                    ))}
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addItem({
                            id: product._id,
                            name: product.name || "Product",
                            price: product.discountPrice || product.price || 0,
                            image: product.images?.[0] || "",
                            quantity: 1,
                            puffCount: product.puffCount,
                            capacity: product.capacity,
                            resistance: product.resistance,
                        });
                    }}
                    className="w-full py-2 bg-blue-600 text-white rounded font-bold text-[10px] uppercase hover:bg-blue-700 transition-colors pointer-events-auto cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                    <ShoppingBag size={12} /> Add to Cart
                </button>
            </div>
        </div>
    );
}
