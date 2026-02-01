"use client";

import Link from "next/link";
import { Menu, ShoppingBag, User, X, Search, Heart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useEffect, useState } from "react";
import Image from "next/image";

import { useRouter } from "next/navigation"; // Add this import

interface HeaderProps {
    categories?: { _id: string; name: string; slug: string }[];
}

export default function Header({ categories = [] }: HeaderProps) {
    const router = useRouter(); // Initialize router
    const { totalItems, openCart } = useCartStore();
    const { items: wishlistItems } = useWishlistStore();
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [siteLogo, setSiteLogo] = useState("/logo.jpg");

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Debouce Search Effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 1) {
                setIsSearching(true);
                try {
                    const res = await fetch(`/api/products?search=${searchQuery}`);
                    if (res.ok) {
                        const data = await res.json();
                        setSearchResults(Array.isArray(data) ? data : (data.products || []));
                    }
                } catch (error) {
                    console.error("Search error:", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    useEffect(() => {
        setMounted(true);
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                if (data.site_logo) {
                    setSiteLogo(data.site_logo);
                }
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        }
    };

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            // Reset overflow
        }
    }, [mobileMenuOpen]);

    return (
        <>
            {/* ROW 1: Desktop Header (Logo | Search | Icons) - Unchanged */}
            <header className="bg-white px-6 border-b border-gray-100 relative shadow-sm z-50">
                <div className="w-full flex items-center justify-between h-[80px]">

                    {/* LEFT: Logo */}
                    <div className="flex items-center">
                        {/* Mobile Hamburger (Visible only on mobile) */}
                        <button
                            className="text-gray-500 md:hidden p-2 -ml-2 mr-2 hover:bg-gray-100 rounded-full transition-colors"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu size={24} />
                        </button>

                        <Link href="/" className="flex flex-col items-center group">
                            <div className="relative w-32 h-16 transform group-hover:scale-105 transition-transform duration-200">
                                <Image
                                    src={siteLogo}
                                    alt="Aladdin Store"
                                    fill
                                    className="object-contain"
                                    priority
                                    unoptimized
                                />
                            </div>
                        </Link>
                    </div>

                    {/* CENTER: Search Bar (Desktop Only) */}
                    <div className="hidden md:flex flex-1 max-w-xl mx-12 relative z-50">
                        <form onSubmit={(e) => { e.preventDefault(); router.push(`/products?query=${searchQuery}`); setIsSearchFocused(false); }} className="flex w-full border-2 border-blue-500 rounded-md overflow-hidden h-[45px] relative">

                            {/* Search Input */}
                            <input
                                type="text"
                                placeholder="Search here..."
                                className="flex-1 px-4 text-sm outline-none text-gray-700 placeholder:text-gray-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                            />
                            {/* Search Button */}
                            <button
                                type="submit"
                                className="bg-blue-500 w-[50px] text-white hover:bg-blue-600 transition flex items-center justify-center"
                            >
                                <Search size={20} />
                            </button>
                        </form>

                        {/* Search Results Dropdown */}
                        {isSearchFocused && searchQuery.length > 1 && (
                            <div
                                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden z-[100]"
                                onMouseDown={(e) => e.preventDefault()} // Prevent input blur on click
                            >
                                {isSearching ? (
                                    <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>
                                ) : searchResults.length > 0 ? (
                                    <ul>
                                        {searchResults.slice(0, 5).map((product: any) => (
                                            <li key={product._id} className="border-b border-gray-50 last:border-none">
                                                <Link
                                                    href={`/product/${product.slug || product._id}`}
                                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                                                    onClick={() => setIsSearchFocused(false)}
                                                >
                                                    <div className="relative w-10 h-10 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                                        {product.images?.[0] && (
                                                            <Image
                                                                src={product.images[0]}
                                                                alt={product.name}
                                                                fill
                                                                className="object-cover"
                                                                unoptimized
                                                            />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-800 line-clamp-1">{product.name}</p>
                                                        {product.discountPrice && product.discountPrice < product.price ? (
                                                            <div className="flex items-center gap-1">
                                                                <p className="text-xs text-red-500 font-bold">INR {product.discountPrice}</p>
                                                                <p className="text-[10px] text-gray-400 line-through">INR {product.price}</p>
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-blue-600 font-bold">INR {product.price}</p>
                                                        )}
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                        <li className="bg-gray-50 p-2 text-center">
                                            <button
                                                onClick={() => {
                                                    router.push(`/products?query=${searchQuery}`);
                                                    setIsSearchFocused(false);
                                                }}
                                                className="text-xs font-bold text-blue-600 hover:underline uppercase w-full block"
                                            >
                                                View all {searchResults.length} results
                                            </button>
                                        </li>
                                    </ul>
                                ) : (
                                    <div className="p-4 text-center text-gray-500 text-sm">No products found.</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Account / Wishlist / Cart */}
                    <div className="flex items-center gap-6">
                        <Link href="/account" className="hidden md:flex flex-col items-center text-gray-600 hover:text-blue-600 transition group">
                            <User size={24} className="group-hover:scale-110 transition-transform" />
                        </Link>

                        <Link href="/wishlist" className="flex flex-col items-center text-gray-600 hover:text-red-500 transition group relative">
                            <div className="relative">
                                <Heart size={24} className="group-hover:scale-110 transition-transform" />
                                {/* Badge */}
                                {mounted && wishlistItems.length > 0 && (
                                    <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-white">
                                        {wishlistItems.length}
                                    </span>
                                )}
                            </div>
                        </Link>

                        <button onClick={openCart} className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition group relative">
                            <div className="relative">
                                <ShoppingBag size={24} className="group-hover:scale-110 transition-transform" />
                                {mounted && (
                                    <span className="absolute -top-1 -right-2 bg-blue-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-white">
                                        {totalItems()}
                                    </span>
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            {/* ROW 2: Category Nav Bar (Desktop Only) */}
            <div className="hidden md:block border-b border-gray-200 bg-white shadow-sm px-6">
                <div className="w-full flex items-center justify-between h-[50px]">


                    {/* Center: Dynamic Category Links */}
                    <nav className="flex items-center gap-8 h-full overflow-x-auto scrollbar-hide mx-auto">
                        {categories.slice(0, 8).map((cat) => (
                            <Link
                                key={cat._id}
                                href={`/products?category=${cat.slug || cat._id}`}
                                className="text-xs font-bold text-gray-800 uppercase hover:text-blue-600 transition flex items-center gap-1 whitespace-nowrap"
                            >
                                {cat.name} <span className="text-[8px] text-gray-400">▼</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* ROW 3: Promo Banner */}
            <div className="bg-[#310131] text-white py-3 px-4 flex items-center justify-center border-t border-purple-900/20">
                <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center text-center text-[10px] md:text-xs font-black tracking-widest uppercase gap-1.5 leading-none">
                    <div className="flex flex-wrap items-center justify-center gap-x-5 md:gap-x-12">
                        <span>Cash on Delivery</span>
                        <span>Free Prepaid Shipping</span>
                    </div>
                    <span>Chat with Us on WhatsApp</span>
                </div>
            </div>

            {/* Mobile Sidebar Menu (Drawer) - UNCHANGED */}
            <div
                className={`fixed inset-0 z-[100] transition-opacity duration-300 md:hidden ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                />

                {/* Drawer */}
                <div className={`absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                    }`}>
                    <div className="p-5 border-b flex items-center justify-between bg-gray-50">
                        <h2 className="font-black text-xl text-gray-800 tracking-tight">MENU</h2>
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-2 -mr-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        <div className="mb-4 pb-4 border-b border-gray-100">
                            <form action="/products" method="GET">
                                <input
                                    type="text"
                                    name="query"
                                    placeholder="Search products..."
                                    className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                />
                            </form>
                        </div>

                        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 font-bold text-gray-700 hover:text-blue-600 transition-colors">
                            Home
                        </Link>
                        <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 font-bold text-gray-700 hover:text-blue-600 transition-colors">
                            All Products
                        </Link>

                        <div className="py-2">
                            <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
                            {categories && categories.length > 0 ? (
                                categories.map((cat) => (
                                    <Link
                                        key={cat._id}
                                        href={`/products?category=${cat.slug || cat._id}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        {cat.name}
                                    </Link>
                                ))
                            ) : (
                                <p className="px-3 text-sm text-gray-500">No categories found</p>
                            )}
                        </div>

                        <div className="py-2 border-t border-gray-100">
                            <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">My Account</p>
                            <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                                Dashboard
                            </Link>
                            <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                                My Orders
                            </Link>
                            <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                                Wishlist
                            </Link>
                        </div>
                    </div>

                    <div className="p-4 border-t bg-gray-50">
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex w-full py-3 bg-blue-600 text-white justify-center items-center font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-transform">
                            Login / Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
