"use client";

import { IProduct } from "@/models/unified";
import ProductCard from "./ProductCard";

interface ProductGridProps {
    products: (Partial<IProduct> & { _id: string })[];
}

export default function ProductGrid({ products }: ProductGridProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-0">
            {products.map((product) => (
                <ProductCard key={product._id} product={product} />
            ))}
        </div>
    );
}
