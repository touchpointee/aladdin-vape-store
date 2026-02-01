"use client";

import { useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { Star, Minus, Plus } from "lucide-react";

interface ProductDetailClientProps {
    product: any;
    whatsappNumber: string;
}

export default function ProductDetailClient({ product, whatsappNumber }: ProductDetailClientProps) {
    const [quantity, setQuantity] = useState(1);
    const { addItem, openCart } = useCartStore();

    const discountedPrice = (product.discountPrice && product.discountPrice < product.price)
        ? product.discountPrice
        : (product.discountPercent
            ? (product.price - (product.price * product.discountPercent / 100))
            : product.price);

    const handleAddToCart = () => {
        addItem({
            id: product._id,
            name: product.name,
            price: discountedPrice,
            image: product.images?.[0] || "/placeholder.png",
            quantity: quantity,
            puffCount: product.puffCount,
            capacity: product.capacity,
            resistance: product.resistance
        });
        openCart();
    };

    const handleBuyViaWhatsApp = () => {
        const message = `Hi, I want to buy:
Product: ${product.name}
Quantity: ${quantity}
Price: ₹${discountedPrice * quantity}
Link: ${window.location.href}`;

        const baseUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : `https://wa.me/`;
        const url = `${baseUrl}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="bg-white min-h-screen pb-24 md:pb-12">
            <div className="md:max-w-6xl md:mx-auto md:p-8 md:grid md:grid-cols-2 md:gap-12 md:items-start">

                {/* Product Images Slider */}
                <div className="relative w-full h-[350px] md:h-[600px] bg-gray-50 flex items-center justify-center border-b md:border md:rounded-lg overflow-hidden">
                    {/* Badges */}
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                        {product.isHot && <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">HOT</span>}
                        {(product.discountPrice && product.discountPrice < product.price) && (
                            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                                -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                            </span>
                        )}
                    </div>

                    <Image
                        src={product.images?.[0] || "/placeholder.png"}
                        alt={product.name}
                        fill
                        className="object-contain p-8 md:p-12 hover:scale-105 transition duration-500"
                        unoptimized
                    />
                </div>

                {/* Info Section */}
                <div className="p-4 md:p-0">
                    <h1 className="text-xl md:text-3xl font-bold text-gray-900 leading-snug mb-2">{product.name}</h1>

                    <div className="flex items-center gap-1 mb-4">
                        <div className="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} className="fill-current" />)}
                        </div>
                        <span className="text-xs text-gray-400">(No reviews)</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-6">
                        <span className="text-2xl md:text-4xl font-bold text-red-500">INR {discountedPrice.toFixed(2)}</span>
                        {discountedPrice < product.price && (
                            <span className="text-sm md:text-lg text-gray-400 line-through">INR {product.price}</span>
                        )}
                    </div>

                    {/* Puff Count & Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {product.puffCount && (
                            <span className="bg-gray-100 text-gray-600 text-xs md:text-sm px-3 py-1 rounded-full border">
                                {product.puffCount} Puffs
                            </span>
                        )}
                        {product.capacity && (
                            <span className="bg-gray-100 text-gray-600 text-xs md:text-sm px-3 py-1 rounded-full border">
                                {product.capacity}
                            </span>
                        )}
                        {product.resistance && (
                            <span className="bg-gray-100 text-gray-600 text-xs md:text-sm px-3 py-1 rounded-full border">
                                {product.resistance}
                            </span>
                        )}
                        <span className="bg-gray-100 text-gray-600 text-xs md:text-sm px-3 py-1 rounded-full border">
                            {product.brand?.name || "Brand"}
                        </span>
                    </div>

                    {/* Description (Moved Up for Desktop) */}
                    <div className="hidden md:block mb-8 text-gray-600 leading-relaxed">
                        {product.description || "No description available."}
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-sm font-semibold text-gray-700">Quantity:</span>
                        <div className="flex items-center border border-gray-300 rounded">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="w-10 text-center font-bold text-gray-900">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <button
                            onClick={handleAddToCart}
                            className="w-full py-3 md:py-4 bg-white border border-blue-500 text-blue-500 font-bold uppercase rounded hover:bg-blue-50 transition"
                        >
                            Add to Cart
                        </button>
                        <button
                            onClick={() => { handleAddToCart(); }}
                            className="w-full py-3 md:py-4 bg-blue-500 text-white font-bold uppercase rounded hover:bg-blue-600 transition shadow-lg shadow-blue-200"
                        >
                            Buy Now
                        </button>
                    </div>

                    <div>
                        <button
                            onClick={handleBuyViaWhatsApp}
                            className="w-full py-3 md:py-4 bg-green-500 text-white font-bold uppercase rounded hover:bg-green-600 flex items-center justify-center gap-2 transition shadow-lg shadow-green-200"
                        >
                            <span>Buy via WhatsApp</span>
                        </button>
                    </div>

                    {/* Description (Mobile Only) */}
                    <div className="md:hidden mt-8 border-t pt-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-2">Description</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {product.description || "No description available."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
