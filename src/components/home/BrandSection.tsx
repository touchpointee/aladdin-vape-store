"use client";

import Link from "next/link";
import Image from "next/image";

interface BrandSectionProps {
    brands: { _id: string; name: string; slug: string; logo?: string }[];
}

export default function BrandSection({ brands }: BrandSectionProps) {
    if (!brands || brands.length === 0) return null;

    return (
        <div className="mt-8 px-4">
            <h3 className="text-lg font-bold text-gray-900 uppercase mb-4">Shop by Brand</h3>
            {/* Horizontal Scroll for Brands */}
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {brands.map((brand) => (
                    <Link
                        key={brand._id}
                        href={`/products?brand=${brand.slug}`}
                        className="flex-none w-[100px] flex flex-col items-center gap-2 group"
                    >
                        <div className="w-[80px] h-[80px] rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center p-2 overflow-hidden group-hover:border-blue-500 transition-colors">
                            {brand.logo ? (
                                <div className="relative w-full h-full">
                                    <Image src={brand.logo} alt={brand.name} fill className="object-contain" />
                                </div>
                            ) : (
                                <span className="text-xs font-bold text-gray-400">{brand.name[0]}</span>
                            )}
                        </div>
                        <span className="text-xs font-medium text-gray-700 text-center line-clamp-1 group-hover:text-blue-600">
                            {brand.name}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
