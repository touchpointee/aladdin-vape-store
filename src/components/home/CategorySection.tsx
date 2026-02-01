"use client";

import Link from "next/link";
import Image from "next/image";

interface CategorySectionProps {
    categories: { _id: string; name: string; image?: string }[];
}

export default function CategorySection({ categories }: CategorySectionProps) {
    if (!categories || categories.length === 0) return null;

    return (
        <div className="w-full">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                    <Link
                        key={cat._id}
                        href={`/products?category=${(cat as any).slug || cat._id}`}
                        className="w-full h-28 md:h-32 group relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100"
                    >
                        {/* Background Image/Color */}
                        <div className="absolute inset-0 bg-gray-100">
                            {cat.image ? (
                                <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 font-bold uppercase text-[10px]">No Image</div>
                            )}
                        </div>

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
                            <span className="text-white font-bold text-xs md:text-sm uppercase tracking-wider line-clamp-1">{cat.name}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
