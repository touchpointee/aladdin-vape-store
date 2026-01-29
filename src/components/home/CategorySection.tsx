"use client";

import Link from "next/link";
import Image from "next/image";

interface CategorySectionProps {
    categories: { _id: string; name: string; image?: string }[];
}

export default function CategorySection({ categories }: CategorySectionProps) {
    if (!categories || categories.length === 0) return null;

    return (
        <div className="mt-8 px-4">
            <h3 className="text-lg font-bold text-gray-900 uppercase mb-4">Shop by Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((cat) => (
                    <Link
                        key={cat._id}
                        href={`/products?category=${cat._id}`}
                        className="group relative h-28 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                    >
                        {/* Background Image/Color */}
                        <div className="absolute inset-0 bg-gray-100">
                            {cat.image ? (
                                <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">No Image</div>
                            )}
                        </div>

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
                            <span className="text-white font-bold text-sm uppercase tracking-wider">{cat.name}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
