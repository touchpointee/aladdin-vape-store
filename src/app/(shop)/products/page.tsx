import { Suspense } from "react";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import ProductGrid from "@/components/product/ProductGrid";
import ProductFilter from "@/components/product/ProductFilter";
import ProductSearchHeader from "@/components/product/ProductSearchHeader";

// Helper to fetch data
async function getData(searchParams: { category?: string; brand?: string; sort?: string; query?: string; isHot?: string; isTopSelling?: string; isNewArrival?: string }) {
    await connectDB();

    const filter: any = { status: "active" };

    // Apply Filters by ID (Directly from searchParams)
    if (searchParams.category) {
        filter.category = searchParams.category;
    }
    if (searchParams.brand) {
        filter.brand = searchParams.brand;
    }

    // Apply Search Query
    if (searchParams.query) {
        filter.name = { $regex: searchParams.query, $options: 'i' };
    }

    // Apply Boolean Filters
    if (searchParams.isHot === 'true') filter.isHot = true;
    if (searchParams.isTopSelling === 'true') filter.isTopSelling = true;
    if (searchParams.isNewArrival === 'true') filter.isNewArrival = true;

    // Apply Sort
    let sort: any = { createdAt: -1 }; // Default: Newest
    if (searchParams.sort === "price_asc") sort = { price: 1 };
    if (searchParams.sort === "price_desc") sort = { price: -1 };

    // Fetch
    const products = await Product.find(filter)
        .populate("category")
        .populate("brand")
        .sort(sort)
        .limit(50); // Pagination can be added later

    const categories = await Category.find({ status: "active" }).select("_id name");
    const brands = await Brand.find({ status: "active" }).select("_id name");

    return { products, categories, brands };
}

export default async function ProductsPage(props: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const searchParams = await props.searchParams;
    // Normalize params
    const category = Array.isArray(searchParams?.category) ? searchParams.category[0] : searchParams?.category;
    const brand = Array.isArray(searchParams?.brand) ? searchParams.brand[0] : searchParams?.brand;
    const sort = Array.isArray(searchParams?.sort) ? searchParams.sort[0] : searchParams?.sort;
    const query = Array.isArray(searchParams?.query) ? searchParams.query[0] : searchParams?.query;
    const isHot = Array.isArray(searchParams?.isHot) ? searchParams.isHot[0] : searchParams?.isHot;
    const isTopSelling = Array.isArray(searchParams?.isTopSelling) ? searchParams.isTopSelling[0] : searchParams?.isTopSelling;
    const isNewArrival = Array.isArray(searchParams?.isNewArrival) ? searchParams.isNewArrival[0] : searchParams?.isNewArrival;

    const { products, categories, brands } = await getData({ category, brand, sort, query, isHot, isTopSelling, isNewArrival });

    // SEO Title
    let pageTitle = "All Products";
    if (category) pageTitle = `${category} Products`;
    if (brand) pageTitle = `${brand} Vapes`;
    if (isHot) pageTitle = "Hot Products";
    if (isTopSelling) pageTitle = "Top Selling Products";
    if (isNewArrival) pageTitle = "New Arrivals";

    // Serialization for Client Components
    const serializedProducts = JSON.parse(JSON.stringify(products));
    const serializedCats = JSON.parse(JSON.stringify(categories));
    const serializedBrands = JSON.parse(JSON.stringify(brands));

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Title */}
            {/* Header / Title Banner */}
            <div className="bg-white border-b border-gray-200 py-8 px-6 mb-8 sticky top-0 md:static z-20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6">


                    {/* Search Bar */}
                    <ProductSearchHeader />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-8">

                {/* Sidebar Filter */}
                <aside className="w-full md:w-[280px] flex-none">
                    <Suspense fallback={<div>Loading filters...</div>}>
                        <ProductFilter categories={serializedCats} brands={serializedBrands} />
                    </Suspense>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    {products.length > 0 ? (
                        <ProductGrid products={serializedProducts} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">We couldn't find any products matching your filters. Try clearing some selections.</p>
                            <a href="/products" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full font-bold uppercase text-sm hover:bg-blue-700 transition">
                                Clear All Filters
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
