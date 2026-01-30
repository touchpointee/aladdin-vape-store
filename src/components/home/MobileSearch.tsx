"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";

export default function MobileSearch() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Debounced Search Effect
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

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!searchQuery.trim()) return;
        router.push(`/products?query=${searchQuery}`);
        setIsFocused(false);
    };

    return (
        <div className="p-4 md:hidden relative z-30">
            <div className="relative">
                <form onSubmit={handleSubmit} className="bg-gray-100 p-3 rounded-xl flex items-center gap-2 text-gray-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all shadow-sm">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400 font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    />
                </form>

                {/* Search Results Dropdown */}
                {isFocused && searchQuery.length > 1 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden z-[100]">
                        {isSearching ? (
                            <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>
                        ) : searchResults.length > 0 ? (
                            <ul>
                                {searchResults.slice(0, 5).map((product: any) => (
                                    <li key={product._id} className="border-b border-gray-50 last:border-none">
                                        <Link
                                            href={`/product/${product._id}`}
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                                            onClick={() => setIsFocused(false)}
                                        >
                                            <div className="relative w-10 h-10 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                                {product.images?.[0] && (
                                                    <Image
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
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
                                            handleSubmit();
                                            setIsFocused(false);
                                        }}
                                        className="text-xs font-bold text-blue-600 hover:underline uppercase block w-full"
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
        </div>
    );
}
