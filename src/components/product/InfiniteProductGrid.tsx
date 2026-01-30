"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { IProduct } from "@/models/all";
import ProductCard from "./ProductCard";
import { Loader2 } from "lucide-react";

interface InfiniteProductGridProps {
    initialProducts: (Partial<IProduct> & { _id: string })[];
    searchParams: any;
}

export default function InfiniteProductGrid({ initialProducts, searchParams }: InfiniteProductGridProps) {
    const [products, setProducts] = useState(initialProducts);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialProducts.length >= 30);
    const observer = useRef<IntersectionObserver | null>(null);

    // Reset when filters change
    useEffect(() => {
        setProducts(initialProducts);
        setPage(1);
        setHasMore(initialProducts.length >= 30);
    }, [initialProducts]);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;
        setLoading(true);

        try {
            const nextPage = page + 1;
            const query = new URLSearchParams();
            Object.entries(searchParams).forEach(([key, value]) => {
                if (value) query.append(key, value as string);
            });
            query.append("page", nextPage.toString());
            query.append("limit", "30");

            const res = await fetch(`/api/products?${query.toString()}`);
            const data = await res.json();

            const newProducts = data.products || [];
            if (newProducts.length > 0) {
                setProducts(prev => [...prev, ...newProducts]);
                setPage(nextPage);
            }

            if (newProducts.length < 30) {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Failed to load more products:", error);
        } finally {
            setLoading(false);
        }
    }, [page, loading, hasMore, searchParams]);

    // Ref for the element that triggers loading
    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        }, {
            rootMargin: '200px', // Start loading before it's actually visible
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore, loadMore]);

    return (
        <div className="flex flex-col gap-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-0">
                {products.map((product, index) => {
                    // Trigger load more when we reach the 20th product from the end (approx)
                    // Or just use a trigger element at the bottom.
                    // The user said: "load 30 first, after scroll reach 20 load next 30"
                    // If we have 30, index 19 (0-based) is the 20th.
                    const isTrigger = index === products.length - 11; // 10 from end of 30 is the 20th.

                    return (
                        <div key={`${product._id}-${index}`} ref={isTrigger ? lastElementRef : null}>
                            <ProductCard product={product} />
                        </div>
                    );
                })}
            </div>

            {loading && (
                <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
            )}

            {!hasMore && products.length > 0 && (
                <div className="text-center text-gray-500 py-8 italic font-medium">
                    You've reached the end of the collection.
                </div>
            )}
        </div>
    );
}
