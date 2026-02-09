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
    const [selectedFlavour, setSelectedFlavour] = useState(product.flavours?.[0] || "");
    const [selectedNicotine, setSelectedNicotine] = useState(product.variants?.[0]?.nicotine || "");
    const { addItem, openCart } = useCartStore();

    // Find current variant based on selection
    const currentVariant = product.variants?.find((v: any) => v.nicotine === selectedNicotine);

    const basePrice = currentVariant ? currentVariant.price : (product.price || 0);
    const baseDiscountPrice = currentVariant ? (currentVariant.discountPrice || currentVariant.price) : (product.discountPrice || product.price || 0);

    const discountedPrice = (baseDiscountPrice && baseDiscountPrice < basePrice)
        ? baseDiscountPrice
        : (product.discountPercent
            ? (basePrice - (basePrice * product.discountPercent / 100))
            : basePrice);

    const handleAddToCart = () => {
        addItem({
            id: product._id,
            name: product.name,
            price: discountedPrice,
            image: product.images?.[0] || "/placeholder.png",
            quantity: quantity,
            puffCount: product.puffCount,
            capacity: product.capacity,
            resistance: product.resistance,
            selectedFlavour: selectedFlavour,
            selectedNicotine: selectedNicotine,
        });
        openCart();
    };

    const handleBuyViaWhatsApp = () => {
        const message = `Hi, I want to buy:
Product: ${product.name}
${selectedFlavour ? `Flavour: ${selectedFlavour}` : ''}
${selectedNicotine ? `Nicotine: ${selectedNicotine}` : ''}
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
                        {product.isHot && <span className="bg-blue-500 text-white text-[10px] font-black px-3 py-1 rounded shadow-lg uppercase tracking-tight">Hot Product</span>}
                        {(basePrice > discountedPrice) && (
                            <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded shadow-lg uppercase tracking-tight">
                                Save {Math.round(((basePrice - discountedPrice) / basePrice) * 100)}%
                            </span>
                        )}
                    </div>

                    <Image
                        src={product.images?.[0] || "/placeholder.png"}
                        alt={product.name}
                        fill
                        className="object-contain p-8 md:p-12 hover:scale-105 transition duration-500"
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
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
                    <div className="flex items-baseline gap-3 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100 w-fit">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Price</span>
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl md:text-5xl font-black text-blue-600">INR {discountedPrice.toFixed(0)}</span>
                                {(basePrice > discountedPrice) && (
                                    <span className="text-sm md:text-xl text-gray-400 line-through font-bold">INR {basePrice}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Flavor Selection */}
                    {product.flavours && product.flavours.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-black text-gray-900 uppercase tracking-widest">1. Select Flavour</span>
                                {selectedFlavour && <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">Selected: {selectedFlavour}</span>}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {product.flavours.map((f: string) => (
                                    <button
                                        key={f}
                                        onClick={() => setSelectedFlavour(f)}
                                        className={`px-5 py-3 rounded-xl border-2 text-sm font-bold transition-all duration-200 ${selectedFlavour === f
                                            ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100 scale-[1.02]'
                                            : 'border-gray-200 hover:border-blue-200 bg-white text-gray-600'
                                            }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Nicotine/Capacity Selection */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-black text-gray-900 uppercase tracking-widest">2. Select Nicotine / Version</span>
                                {selectedNicotine && <span className="text-xs font-bold text-purple-500 bg-purple-50 px-2 py-0.5 rounded">Selected: {selectedNicotine}</span>}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {product.variants.map((v: any) => (
                                    <button
                                        key={v.nicotine}
                                        onClick={() => setSelectedNicotine(v.nicotine)}
                                        className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${selectedNicotine === v.nicotine
                                            ? 'border-purple-600 bg-purple-50 shadow-lg shadow-purple-50 scale-[1.02]'
                                            : 'border-gray-100 hover:border-purple-200 bg-white'
                                            }`}
                                    >
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-black uppercase ${selectedNicotine === v.nicotine ? 'text-purple-700' : 'text-gray-900'}`}>{v.nicotine}</span>
                                            <span className="text-xs font-bold text-gray-400 mt-1">₹{v.discountPrice || v.price}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

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
