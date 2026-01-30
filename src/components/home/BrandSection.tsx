"use client";

import Link from "next/link";
import Image from "next/image";

interface BrandSectionProps {
    brands: { _id: string; name: string; logo?: string }[];
}

export default function BrandSection({ brands }: BrandSectionProps) {
    if (!brands || brands.length === 0) return null;

    return (
        <div className="mt-8 px-4">
            <h3 className="text-lg font-bold text-gray-900 uppercase mb-4">Shop by Brand</h3>
            {/* Horizontal Scroll for Brands */}
            <div className="grid grid-cols-2 gap-4">
                {brands.map((brand) => (
                    <Link
                        key={brand._id}
                        href={`/products?brand=${brand._id}`}
                        className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-blue-500 hover:shadow-sm transition-all bg-white group"
                    >
                        <div className="w-16 h-16 relative mb-2">
                            {brand.logo ? (
                                <Image src={brand.logo} alt={brand.name} fill className="object-contain" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                                    <span className="text-xl font-bold text-gray-400">{brand.name[0]}</span>
                                </div>
                            )}
                        </div>
                        <span className="text-xs font-bold text-gray-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors text-center">
                            {brand.name}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
