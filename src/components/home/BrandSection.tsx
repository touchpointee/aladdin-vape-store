"use client";

import Link from "next/link";
import Image from "next/image";

interface BrandSectionProps {
    brands: { _id: string; name: string; logo?: string }[];
}

export default function BrandSection({ brands }: BrandSectionProps) {
    if (!brands || brands.length === 0) return null;

    return (
        <div className="mt-12 px-4 max-w-7xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 uppercase mb-6 tracking-tight">Shop by Brand</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {brands.map((brand) => (
                    <Link
                        key={brand._id}
                        href={`/products?brand=${(brand as any).slug || brand._id}`}
                        className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all bg-white group aspect-[4/3] md:aspect-square"
                    >
                        <div className="w-full h-full relative mb-2">
                            {brand.logo ? (
                                <Image src={brand.logo} alt={brand.name} fill className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" unoptimized />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center border border-dashed border-gray-200">
                                    <span className="text-2xl font-black text-gray-200">{brand.name[0]}</span>
                                </div>
                            )}
                        </div>
                        <span className="text-[10px] md:text-xs font-bold text-gray-900 uppercase tracking-widest group-hover:text-blue-600 transition-colors text-center truncate w-full px-1">
                            {brand.name}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
