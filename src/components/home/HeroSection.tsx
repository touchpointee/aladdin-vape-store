import Link from "next/link";
import Image from "next/image";

interface BannerSettings {
    image: string;
    link: string;
    title: string;
    subtitle: string;
    badge: string;
}

interface HeroSectionProps {
    settings?: {
        banner1?: BannerSettings;
        banner2?: BannerSettings;
    } | null;
}

export default function HeroSection({ settings }: HeroSectionProps) {
    const banner1 = settings?.banner1 || {
        image: "/banner-disposable.png",
        link: "/products?category=disposables",
        title: "Disposable\nVapes",
        subtitle: "",
        badge: "New Arrivals"
    };

    const banner2 = settings?.banner2 || {
        image: "/banner-mod.png",
        link: "/products?category=kits",
        title: "Vape\nKits",
        subtitle: "",
        badge: "Best Sellers"
    };

    const renderBanner = (banner: BannerSettings, theme: 'purple' | 'blue') => {
        // Fallback checks
        const imageUrl = banner.image || (theme === 'purple' ? "/banner-disposable.png" : "/banner-mod.png");
        const linkUrl = banner.link || "/products";
        const titleLines = (banner.title || (theme === 'purple' ? "Disposable\nVapes" : "Vape\nKits")).split('\n');

        return (
            <div className="relative w-full h-[300px] md:h-[420px] rounded-2xl overflow-hidden shadow-sm group">
                <Image
                    src={imageUrl}
                    alt={banner.title || "Banner"}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority={theme === 'purple'}
                />
                {/* No Overlay - Direct text on image with shadow for readability */}
                <div className="absolute inset-0 flex flex-col justify-center pl-10 md:pl-12 z-10 w-full sm:w-[80%] md:w-[70%] text-left">
                    {banner.badge && (
                        <span className="text-white text-xs md:text-sm font-bold tracking-widest uppercase mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                            {banner.badge}
                        </span>
                    )}
                    <h2 className="text-white text-4xl md:text-5xl font-black uppercase leading-[0.9] mb-4 md:mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {titleLines.map((line, i) => (
                            <span key={i}>
                                {line}
                                {i < titleLines.length - 1 && <br />}
                            </span>
                        ))}
                    </h2>
                    {banner.subtitle && (
                        <p className="text-white text-sm mb-4 font-medium opacity-90 line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{banner.subtitle}</p>
                    )}
                    <Link href={linkUrl} className="self-start bg-white text-black text-xs font-bold py-3 px-8 rounded shadow-lg hover:bg-gray-100 transition-all uppercase tracking-wide transform hover:scale-105 active:scale-95">
                        Shop Now
                    </Link>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full p-4 flex flex-col gap-6">
            {/* Main Row: Two Large Banners (50% / 50%) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {renderBanner(banner1, 'purple')}
                {renderBanner(banner2, 'blue')}
            </div>
        </div>
    );
}
