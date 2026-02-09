import Link from "next/link";
import Image from "next/image";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import BrandSection from "@/components/home/BrandSection";
import ProductGrid from "@/components/product/ProductGrid";
import MobileSearch from "@/components/home/MobileSearch";
import PromoBanner from "@/components/home/PromoBanner";
import connectDB from "@/lib/db";
import { Product, Category, Brand, Settings } from "@/models/unified";

export const revalidate = 3600; // revalidate at most every hour

async function getHomeData() {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.warn("Skipping data fetch - DB Connection failed");
      return { products: [], categories: [], brands: [], newArrivals: [], disposables: [], bannerSettings: null };
    }

    // Parallel fetching for performance
    const [products, categories, brands, newArrivals, disposables, settingsDoc] = await Promise.all([
      // Hot Products
      Product.find({ status: { $regex: '^active$', $options: 'i' }, isHot: true }).sort({ createdAt: -1 }).limit(8).lean(),
      // Categories
      Category.find({ status: { $regex: '^active$', $options: 'i' } }).sort({ createdAt: -1 }).lean(),
      // Brands
      Brand.find({ status: { $regex: '^active$', $options: 'i' } }).sort({ createdAt: -1 }).lean(),
      // New Arrivals
      Product.find({ status: { $regex: '^active$', $options: 'i' }, isNewArrival: true }).sort({ createdAt: -1 }).limit(8).lean(),
      // Top Selling
      Product.find({ status: { $regex: '^active$', $options: 'i' }, isTopSelling: true }).sort({ createdAt: -1 }).limit(8).lean(),
      // Settings
      Settings.findOne({ key: 'home_banners' }).lean(),
    ]);

    const serialize = (items: any[]) => items.map(i => ({
      ...i,
      _id: i._id.toString(),
      brand: i.brand?.toString(),
      category: i.category?.toString()
    }));

    let bannerSettings = null;
    if (settingsDoc && settingsDoc.value) {
      try {
        bannerSettings = JSON.parse(settingsDoc.value);
      } catch (e) {
        console.error("Failed to parse banner settings", e);
      }
    }

    return {
      products: serialize(products),
      categories: serialize(categories),
      brands: serialize(brands),
      newArrivals: serialize(newArrivals),
      disposables: serialize(disposables),
      bannerSettings
    };

  } catch (error) {
    console.warn("DB not ready or error:", error);
    return { products: [], categories: [], brands: [], newArrivals: [], disposables: [], bannerSettings: null };
  }
}

export default async function Home() {
  const { products, categories, brands, newArrivals, disposables, bannerSettings } = await getHomeData();

  return (
    <div className="pb-24">
      <h1 className="sr-only">Aladdin Vape Store | Best Premium Vapes and Accessories in India</h1>
      {/* Search Bar - Mobile Visible Only */}
      <MobileSearch />

      {/* Top Main Section: Banner Left, Categories Right (PC) */}
      <div className="px-4 max-w-7xl mx-auto mt-6">
        <div className="flex flex-col md:grid md:grid-cols-12 gap-6 lg:gap-10">

          {/* Brand Banner - Left Column */}
          <div className="md:col-span-5 lg:col-span-4">
            <Link
              href="/products"
              className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-2xl border bg-black block group hover:opacity-90 transition-opacity"
            >
              <Image
                src="/brand-banner.png"
                alt="Aladdin Store"
                fill
                className="object-cover object-center"
                priority
                unoptimized
              />
            </Link>
          </div>

          {/* Categories - Right Column */}
          <div className="md:col-span-7 lg:col-span-8">
            <h3 className="text-xl font-black text-gray-900 uppercase mb-6 tracking-tight flex items-center gap-2">
              <span className="w-8 h-[2px] bg-blue-600"></span> Shop by Category
            </h3>
            <CategorySection categories={categories as any} />
          </div>

        </div>
      </div>

      {/* 3. New Arrivals Section */}
      <div className="mt-12 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">New Arrivals</h3>
          <Link href="/products?isNewArrival=true" className="text-xs text-blue-500 font-bold uppercase hover:underline">
            View All
          </Link>
        </div>
        <ProductGrid products={newArrivals as any} />
      </div>

      {/* 4. Promo Banner */}
      {/* <PromoBanner /> */}

      {/* 5. Brands */}
      <BrandSection brands={brands as any} />

      {/* 6. Hot Products */}
      <div className="mt-12 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Hot Products</h3>
          <Link href="/products?isHot=true" className="text-xs text-blue-500 font-bold uppercase hover:underline">
            View All
          </Link>
        </div>
        <ProductGrid products={products as any} />
      </div>

      {/* 7. Top Selling Products */}
      <div className="mt-12 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Top Selling</h3>
          <Link href="/products?isTopSelling=true" className="text-xs text-blue-500 font-bold uppercase hover:underline">
            View All
          </Link>
        </div>
        <ProductGrid products={disposables as any} />
      </div>

    </div>
  );
}
