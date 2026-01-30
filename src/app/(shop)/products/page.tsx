import { Suspense } from "react";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import ProductFilter from "@/components/product/ProductFilter";
import ProductSearchHeader from "@/components/product/ProductSearchHeader";
import InfiniteProductGrid from "@/components/product/InfiniteProductGrid";
import { Metadata } from "next";
import Script from "next/script";

export const revalidate = 3600; // revalidate at most every hour

interface SearchParams {
    category?: string;
    brand?: string;
    sort?: string;
    query?: string;
    isHot?: string;
    isTopSelling?: string;
    isNewArrival?: string;
    page?: string;
}

export async function generateMetadata(props: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
    const searchParams = await props.searchParams;
    await connectDB();

    let title = "Vape Products | Aladdin Vape Store India";
    let description = "Browse our extensive collection of premium vapes, disposable pods, and accessories at Aladdin Vape Store.";

    if (searchParams.category) {
        const cat = searchParams.category.match(/^[0-9a-fA-F]{24}$/)
            ? await Category.findById(searchParams.category)
            : await Category.findOne({ slug: searchParams.category });

        if (cat) {
            title = `${cat.name} Vapes | Aladdin Vape Store`;
            description = `Shop the best ${cat.name} vapes and accessories in India. Authentic products and fast delivery.`;
        }
    } else if (searchParams.brand) {
        const brand = searchParams.brand.match(/^[0-9a-fA-F]{24}$/)
            ? await Brand.findById(searchParams.brand)
            : await Brand.findOne({ slug: searchParams.brand });

        if (brand) {
            title = `${brand.name} Vapes | Aladdin Vape Store`;
            description = `Premium ${brand.name} vape products available at Aladdin Vape Store. 100% authentic.`;
        }
    } else if (searchParams.query) {
        title = `Search results for "${searchParams.query}" | Aladdin Vape Store`;
    }

    return {
        title,
        description,
        alternates: {
            canonical: `/products${searchParams.category ? `?category=${searchParams.category}` : searchParams.brand ? `?brand=${searchParams.brand}` : ''}`
        },
        openGraph: {
            title,
            description,
            url: 'https://aladdinvapestoreindia.com/products',
        }
    };
}

// Helper to fetch data
async function getData(searchParams: SearchParams) {
    await connectDB();

    const filter: any = { status: { $regex: '^active$', $options: 'i' } };

    // Apply Filters by ID or Slug
    if (searchParams.category) {
        if (searchParams.category.match(/^[0-9a-fA-F]{24}$/)) {
            filter.category = searchParams.category;
        } else {
            const cat = await Category.findOne({ slug: searchParams.category });
            if (cat) filter.category = cat._id;
        }
    }
    if (searchParams.brand) {
        if (searchParams.brand.match(/^[0-9a-fA-F]{24}$/)) {
            filter.brand = searchParams.brand;
        } else {
            const brand = await Brand.findOne({ slug: searchParams.brand });
            if (brand) filter.brand = brand._id;
        }
    }
    if (searchParams.query) filter.name = { $regex: searchParams.query, $options: 'i' };

    // Apply Boolean Filters
    if (searchParams.isHot === 'true') filter.isHot = true;
    if (searchParams.isTopSelling === 'true') filter.isTopSelling = true;
    if (searchParams.isNewArrival === 'true') filter.isNewArrival = true;

    // Apply Sort
    let sort: any = { createdAt: -1 };
    if (searchParams.sort === "price_asc") sort = { price: 1 };
    if (searchParams.sort === "price_desc") sort = { price: -1 };

    // Initial limit for Infinite Scroll
    const limit = 30;

    // Fetch
    const [products, totalProducts] = await Promise.all([
        Product.find(filter)
            .populate("category")
            .populate("brand")
            .sort(sort)
            .limit(limit),
        Product.countDocuments(filter)
    ]);

    const categories = await Category.find({ status: { $regex: '^active$', $options: 'i' } }).select("_id name slug");
    const brands = await Brand.find({ status: { $regex: '^active$', $options: 'i' } }).select("_id name slug");

    let activeCategoryName = "";
    if (searchParams.category) {
        const cat = categories.find(c => c._id.toString() === searchParams.category || (c as any).slug === searchParams.category);
        if (cat) activeCategoryName = cat.name;
    }

    return { products, totalProducts, categories, brands, activeCategoryName };
}

export default async function ProductsPage(props: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const rawSearchParams = await props.searchParams;

    // Normalize params
    const searchParams: SearchParams = {
        category: Array.isArray(rawSearchParams?.category) ? rawSearchParams.category[0] : rawSearchParams?.category,
        brand: Array.isArray(rawSearchParams?.brand) ? rawSearchParams.brand[0] : rawSearchParams?.brand,
        sort: Array.isArray(rawSearchParams?.sort) ? rawSearchParams.sort[0] : rawSearchParams?.sort,
        query: Array.isArray(rawSearchParams?.query) ? rawSearchParams.query[0] : rawSearchParams?.query,
        isHot: Array.isArray(rawSearchParams?.isHot) ? rawSearchParams.isHot[0] : rawSearchParams?.isHot,
        isTopSelling: Array.isArray(rawSearchParams?.isTopSelling) ? rawSearchParams.isTopSelling[0] : rawSearchParams?.isTopSelling,
        isNewArrival: Array.isArray(rawSearchParams?.isNewArrival) ? rawSearchParams.isNewArrival[0] : rawSearchParams?.isNewArrival,
    };

    const { products, categories, brands, activeCategoryName } = await getData(searchParams);

    // Breadcrumb Schema
    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://aladdinvapestoreindia.com"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Products",
                "item": "https://aladdinvapestoreindia.com/products"
            },
            ...(activeCategoryName ? [{
                "@type": "ListItem",
                "position": 3,
                "name": activeCategoryName,
                "item": `https://aladdinvapestoreindia.com/products?category=${searchParams.category}`
            }] : [])
        ]
    };

    // Serialization for Client Components
    const serializedProducts = JSON.parse(JSON.stringify(products));
    const serializedCats = JSON.parse(JSON.stringify(categories));
    const serializedBrands = JSON.parse(JSON.stringify(brands));

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Script
                id="breadcrumb-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            {/* Header / Title Banner */}
            <div className="bg-white border-b border-gray-200 py-8 px-6 mb-8 sticky top-0 md:static z-20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
                        {activeCategoryName || "All Products"}
                    </h1>
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
                        <InfiniteProductGrid initialProducts={serializedProducts} searchParams={searchParams} />
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
