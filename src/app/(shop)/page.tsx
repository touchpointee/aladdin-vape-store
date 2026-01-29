import Link from "next/link";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import BrandSection from "@/components/home/BrandSection";
import ProductGrid from "@/components/product/ProductGrid";
import MobileSearch from "@/components/home/MobileSearch";
import PromoBanner from "@/components/home/PromoBanner";
import connectDB from "@/lib/db";
import { Product, Category, Brand, Settings } from "@/models/all";

export const dynamic = 'force-dynamic';

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
      Product.find({ status: 'active', isHot: true }).sort({ createdAt: -1 }).limit(8).lean(),
      // Categories
      Category.find({ status: 'active' }).sort({ createdAt: -1 }).lean(),
      // Brands
      Brand.find({ status: 'active' }).sort({ createdAt: -1 }).lean(),
      // New Arrivals
      Product.find({ status: 'active', isNewArrival: true }).sort({ createdAt: -1 }).limit(8).lean(),
      // Top Selling
      Product.find({ status: 'active', isTopSelling: true }).sort({ createdAt: -1 }).limit(8).lean(),
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
      {/* Search Bar - Mobile Visible Only */}
      <MobileSearch />

      <HeroSection settings={bannerSettings} />

      {/* 2. Categories */}
      <CategorySection categories={categories as any} />

      {/* 3. New Arrivals Section */}
      <div className="mt-12 px-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">New Arrivals</h3>
          <Link href="/products?isNewArrival=true" className="text-xs text-blue-500 font-bold uppercase hover:underline">
            View All
          </Link>
        </div>
        <ProductGrid products={newArrivals as any} />
      </div>

      {/* 4. Promo Banner */}
      <PromoBanner />

      {/* 5. Brands */}
      <BrandSection brands={brands as any} />

      {/* 6. Hot Products */}
      <div className="mt-12 px-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Hot Products</h3>
          <Link href="/products?isHot=true" className="text-xs text-blue-500 font-bold uppercase hover:underline">
            View All
          </Link>
        </div>
        <ProductGrid products={products as any} />
      </div>

      {/* 7. Top Selling Products */}
      <div className="mt-12 px-4">
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
