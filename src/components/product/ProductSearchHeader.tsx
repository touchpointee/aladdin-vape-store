"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export default function ProductSearchHeader() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams?.get("query") || "");

    useEffect(() => {
        setQuery(searchParams?.get("query") || "");
    }, [searchParams]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams?.toString() || "");
        if (query.trim()) {
            params.set("query", query);
        } else {
            params.delete("query");
        }
        params.delete("page"); // Reset page on new search
        router.push(`/products?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSearch} className="relative max-w-md w-full">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search within products..."
                className="w-full bg-gray-100 border-2 border-transparent focus:border-blue-500 focus:bg-white text-gray-800 text-sm font-medium rounded-full py-3 pl-5 pr-12 outline-none transition-all placeholder:text-gray-400"
            />
            <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                aria-label="Search"
            >
                <Search size={20} />
            </button>
        </form>
    );
}
