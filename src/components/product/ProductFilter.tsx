"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Filter } from "lucide-react";

interface FilterProps {
    categories: { _id: string; name: string; slug?: string }[];
    brands: { _id: string; name: string; slug?: string }[];
}

export default function ProductFilter({ categories, brands }: FilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);

    // Initial State from URL
    const initialCategory = searchParams?.get("category");
    const initialBrand = searchParams?.get("brand");
    const initialSort = searchParams?.get("sort") || "newest";

    const [localCategory, setLocalCategory] = useState<string | null>(initialCategory || null);
    const [localBrand, setLocalBrand] = useState<string | null>(initialBrand || null);
    const [localSort, setLocalSort] = useState<string>(initialSort);

    // Sync local state when URL changes (e.g. clear filters from outside)
    useEffect(() => {
        setLocalCategory(searchParams?.get("category") || null);
        setLocalBrand(searchParams?.get("brand") || null);
        setLocalSort(searchParams?.get("sort") || "newest");
    }, [searchParams]);

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams?.toString() || "");

        if (localCategory) params.set("category", localCategory);
        else params.delete("category");

        if (localBrand) params.set("brand", localBrand);
        else params.delete("brand");

        if (localSort) params.set("sort", localSort);
        else params.delete("sort");

        params.delete("page"); // Reset page

        router.push(`/products?${params.toString()}`, { scroll: false });
        setIsOpen(false);
    };

    // Instant update for desktop (optional) or just use Apply button for everything?
    // User complaint was mostly mobile. Let's make it consistent. 
    // Actually, for desktop, instant click is nice. 
    // We can detect if mobile drawer is open.

    const onFilterChange = (type: "category" | "brand" | "sort", value: string | null) => {
        if (type === "category") setLocalCategory(value);
        if (type === "brand") setLocalBrand(value);
        if (type === "sort") setLocalSort(value || "newest");
    };

    // Apply effect for Desktop (Instant)
    const isMobile = isOpen; // Rough proxy

    useEffect(() => {
        if (!isMobile) {
            // Compare local state with URL params to avoid redundant pushes
            const currentCat = searchParams?.get("category") || null;
            const currentBrand = searchParams?.get("brand") || null;
            const currentSort = searchParams?.get("sort") || "newest";

            if (localCategory !== currentCat || localBrand !== currentBrand || localSort !== currentSort) {
                const timeout = setTimeout(() => {
                    applyFilters();
                }, 300); // Small debounce
                return () => clearTimeout(timeout);
            }
        }
    }, [localCategory, localBrand, localSort, isMobile]);


    return (
        <>
            {/* Mobile Filter Toggle */}
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden w-full mb-4 flex items-center justify-center gap-2 bg-white p-3 rounded-lg shadow-sm font-bold border border-gray-200"
            >
                <Filter size={20} /> Filter & Sort
            </button>

            {/* Filter Sidebar Container - 80% Width on Mobile */}
            <div
                className={`
                    fixed inset-0 z-[9999] bg-black/50 transition-opacity duration-300 md:static md:bg-transparent md:z-0
                    ${isOpen ? "opacity-100 visible" : "opacity-0 invisible md:opacity-100 md:visible"}
                `}
                onClick={() => setIsOpen(false)}
            >
                <div
                    className={`
                        fixed inset-y-0 left-0 w-[80vw] max-w-[320px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:static md:w-full md:max-w-none md:shadow-none md:transform-none flex flex-col
                        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                    `}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Mobile Header (Sticky) */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white md:hidden shadow-sm z-[10000]">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Filters & Sort</h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 -mr-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Close filters"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-5 md:p-0 safe-pb-20">

                        {/* Sort */}
                        <div className="mb-8">
                            <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Sort By</h3>
                            <div className="relative">
                                <select
                                    value={localSort}
                                    onChange={(e) => onFilterChange("sort", e.target.value)}
                                    className="w-full appearance-none p-3 px-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-black/5"
                                >
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Categories</h3>
                                {localCategory && (
                                    <button
                                        onClick={() => onFilterChange("category", null)}
                                        className="text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 px-2 py-1 rounded-full transition-colors"
                                    >Clear</button>
                                )}
                            </div>
                            <div className="space-y-3">
                                {categories.map((cat) => (
                                    <label key={cat._id} className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 hover:border-gray-200 bg-white shadow-sm">
                                        <div className={`
                                        w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200 flex-shrink-0
                                        ${localCategory === (cat.slug || cat._id) ? "bg-black border-black" : "border-gray-300 bg-white group-hover:border-gray-400"}
                                    `}>
                                            {localCategory === (cat.slug || cat._id) && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <input
                                            type="radio"
                                            name="category"
                                            className="absolute opacity-0 w-0 h-0"
                                            checked={localCategory === (cat.slug || cat._id)}
                                            onChange={() => onFilterChange("category", cat.slug || cat._id)}
                                        />
                                        <span className={`text-sm ${localCategory === (cat.slug || cat._id) ? "text-black font-bold" : "text-gray-600 group-hover:text-gray-900"}`}>
                                            {cat.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Brands */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Brands</h3>
                                {localBrand && (
                                    <button
                                        onClick={() => onFilterChange("brand", null)}
                                        className="text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 px-2 py-1 rounded-full transition-colors"
                                    >Clear</button>
                                )}
                            </div>
                            <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {brands.map((brand) => (
                                    <label key={brand._id} className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 hover:border-gray-200 bg-white shadow-sm">
                                        <div className={`
                                        w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200 flex-shrink-0
                                        ${localBrand === (brand.slug || brand._id) ? "bg-black border-black" : "border-gray-300 bg-white group-hover:border-gray-400"}
                                    `}>
                                            {localBrand === (brand.slug || brand._id) && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <input
                                            type="radio"
                                            name="brand"
                                            className="absolute opacity-0 w-0 h-0"
                                            checked={localBrand === (brand.slug || brand._id)}
                                            onChange={() => onFilterChange("brand", brand.slug || brand._id)}
                                        />
                                        <span className={`text-sm ${localBrand === (brand.slug || brand._id) ? "text-black font-bold" : "text-gray-600 group-hover:text-gray-900"}`}>
                                            {brand.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Footer (Sticky) */}
                    <div className="p-4 border-t border-gray-100 bg-white md:hidden z-[10000]">
                        <button
                            onClick={applyFilters}
                            className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase text-sm tracking-widest hover:bg-gray-800 active:scale-[0.98] transition-all shadow-lg shadow-black/10"
                        >
                            Show Results
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
