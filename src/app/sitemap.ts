import { MetadataRoute } from 'next';
import connectDB from '@/lib/db';
import { Product, Category, Brand } from '@/models/all';

const BASE_URL = 'https://aladdinvapestoreindia.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    await connectDB();

    // Fetch all active products
    const products = await Product.find({ status: 'active' }).select('_id slug updatedAt');
    const productEntries = products.map((product) => ({
        url: `${BASE_URL}/product/${product.slug || product._id}`,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // Fetch all active categories
    const categories = await Category.find({ status: 'active' }).select('_id slug name updatedAt');
    const categoryEntries = categories.map((cat) => ({
        url: `${BASE_URL}/products?category=${cat.slug || cat._id}`,
        lastModified: cat.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    // Fetch all active brands
    const brands = await Brand.find({ status: 'active' }).select('_id slug name updatedAt');
    const brandEntries = brands.map((brand) => ({
        url: `${BASE_URL}/products?brand=${brand.slug || brand._id}`,
        lastModified: brand.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.5,
    }));

    // Static routes
    const staticRoutes = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/products`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/wishlist`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.3,
        },
    ];

    return [...staticRoutes, ...productEntries, ...categoryEntries, ...brandEntries];
}
