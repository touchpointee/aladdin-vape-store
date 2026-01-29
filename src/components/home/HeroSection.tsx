import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
    return (
        <div className="w-full p-4 flex flex-col gap-6">

            {/* Main Row: Two Large Banners (50% / 50%) - Retained Banner 2 and 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

                {/* 1. Buy DISPOSABLE VAPES (Was Banner 2) */}
                <div className="relative w-full h-[300px] md:h-[420px] rounded-2xl overflow-hidden shadow-sm group bg-purple-50">
                    <Image
                        src="/banner-disposable.png"
                        alt="Buy Disposable Vapes"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        priority
                    />
                    {/* Gradient Overlay - Purple theme */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-purple-700/50 to-transparent flex flex-col justify-center pl-12 z-10 w-[60%]">
                        <span className="text-white text-sm font-bold tracking-widest uppercase mb-2 drop-shadow-sm">New Arrivals</span>
                        <h2 className="text-white text-5xl font-black uppercase leading-[0.9] mb-6 drop-shadow-md">Disposable<br />Vapes</h2>
                        <Link href="/products?category=disposables" className="self-start bg-white text-purple-700 text-xs font-bold py-3 px-8 rounded shadow-lg hover:bg-gray-100 transition-all uppercase tracking-wide transform hover:scale-105 active:scale-95">
                            Shop Now
                        </Link>
                    </div>
                </div>

                {/* 2. Buy VAPE KITS (Was Banner 3) */}
                <div className="relative w-full h-[300px] md:h-[420px] rounded-2xl overflow-hidden shadow-sm group bg-blue-50">
                    <Image
                        src="/banner-mod.png"
                        alt="Buy Vape Kits"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Gradient Overlay - Blue theme */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-800 via-blue-700/50 to-transparent flex flex-col justify-center pl-12 z-10 w-[60%]">
                        <span className="text-white text-sm font-bold tracking-widest uppercase mb-2 drop-shadow-sm">Best Sellers</span>
                        <h2 className="text-white text-5xl font-black uppercase leading-[0.9] mb-6 drop-shadow-md">Vape<br />Kits</h2>
                        <Link href="/products?category=kits" className="self-start bg-white text-blue-700 text-xs font-bold py-3 px-8 rounded shadow-lg hover:bg-gray-100 transition-all uppercase tracking-wide transform hover:scale-105 active:scale-95">
                            Shop Now
                        </Link>
                    </div>
                </div>

            </div>

        </div>
    );
}
