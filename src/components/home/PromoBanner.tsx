import Image from "next/image";
import Link from "next/link";

export default function PromoBanner() {
    return (
        <div className="w-full h-[250px] md:h-[350px] relative my-12 overflow-hidden group">
            <Image
                src="/promo-banner.png"
                alt="Weekend Sale"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                unoptimized
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-4">
                <span className="text-white font-bold tracking-[0.2em] uppercase mb-2 animate-fade-in-up">Limited Time Offer</span>
                <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase mb-6 drop-shadow-lg transform -skew-x-6">
                    Weekend Super Sale
                </h2>
                <Link
                    href="/products?isHot=true"
                    className="bg-white text-gray-900 font-bold uppercase py-3 px-8 rounded-full hover:bg-black hover:text-white transition-all transform hover:scale-105 shadow-xl"
                >
                    Grab Deal
                </Link>
            </div>
        </div>
    );
}
