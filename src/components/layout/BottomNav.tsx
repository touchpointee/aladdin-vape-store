"use client";

import Link from "next/link";
import { Home, User, Heart, ShoppingBag, LayoutGrid } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function BottomNav() {
    const { openCart, totalItems } = useCartStore();
    const [mounted, setMounted] = useState(false);
    const pathnameOriginal = usePathname();
    const pathname = pathnameOriginal || '';

    useEffect(() => {
        setMounted(true);
    }, []);

    // Determine active tabs
    // Shop is strictly Home now
    const isActiveShop = pathname === '/';

    // Products takes over product routes (was Search)
    const isActiveProducts = pathname.startsWith('/products') || pathname.startsWith('/product') || pathname.startsWith('/category');

    // Account remains same
    const isActiveAccount = pathname.startsWith('/account') || pathname.startsWith('/orders') || pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/admin');

    const isActiveWishlist = pathname.startsWith('/wishlist');

    return (
        <div className="w-full bg-white border-t border-gray-100 pb-safe relative">
            <div className="flex justify-around items-center h-16">
                <Link href="/" className={`flex flex-col items-center justify-center w-full h-full ${isActiveShop ? 'text-blue-600' : 'text-gray-500'}`}>
                    {/* Active state */}
                    <div className={`${isActiveShop ? 'bg-blue-600 p-2 text-white shadow-lg shadow-blue-200' : 'p-1'} rounded-full mb-1 transition-all`}>
                        <Home size={20} />
                    </div>
                    <span className="text-[10px] font-medium">SHOP</span>
                </Link>

                <Link href="/products" className={`flex flex-col items-center justify-center w-full h-full ${isActiveProducts ? 'text-blue-600' : 'text-gray-500'}`}>
                    <div className={`${isActiveProducts ? 'bg-blue-600 p-2 text-white shadow-lg shadow-blue-200' : 'p-1'} rounded-full mb-1 transition-all`}>
                        <LayoutGrid size={20} />
                    </div>
                    <span className="text-[10px] font-medium">PRODUCTS</span>
                </Link>

                <Link href="/wishlist" className={`flex flex-col items-center justify-center w-full h-full ${isActiveWishlist ? 'text-blue-600' : 'text-gray-500 relative'}`}>
                    <div className={`${isActiveWishlist ? 'bg-blue-600 p-2 text-white shadow-lg shadow-blue-200' : 'p-1'} rounded-full mb-1 transition-all relative`}>
                        <Heart size={20} />
                        {mounted && totalItems() > 0 && !isActiveWishlist && (
                            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                {totalItems()}
                            </span>
                        )}
                    </div>
                    {mounted && totalItems() > 0 && isActiveWishlist && (
                        <span className="absolute top-0 right-8 bg-red-500 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white z-10">
                            {totalItems()}
                        </span>
                    )}
                    <span className="text-[10px] font-medium">WISHLIST</span>
                </Link>

                <Link href="/account" className={`flex flex-col items-center justify-center w-full h-full ${isActiveAccount ? 'text-blue-600' : 'text-gray-500'}`}>
                    <div className={`${isActiveAccount ? 'bg-blue-600 p-2 text-white shadow-lg shadow-blue-200' : 'p-1'} rounded-full mb-1 transition-all`}>
                        <User size={20} />
                    </div>
                    <span className="text-[10px] font-medium">ACCOUNT</span>
                </Link>
            </div>

        </div>
    );
}
