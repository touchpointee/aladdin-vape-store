import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        // Find all products
        const products = await Product.find({});
        let updatedCount = 0;
        let errors = 0;

        for (const product of products) {
            try {
                const update: any = {};

                // Manually generate if missing or empty
                if (!product.slug) {
                    const generatedSlug = product.name
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .trim();
                    update.slug = generatedSlug;
                }

                if (!product.metaTitle || product.metaTitle.includes('Aladdin Vape Store')) {
                    update.metaTitle = `${product.name} | Buy Online | Best Price in India | Aladdin Vape Store`;
                }

                if (!product.metaDescription && product.description) {
                    const plainDesc = product.description.replace(/<[^>]*>/g, '').substring(0, 155);
                    update.metaDescription = plainDesc + (product.description.length > 155 ? '...' : '');
                }

                if (Object.keys(update).length > 0) {
                    // Use collection.updateOne to bypass ALL Mongoose logic and ensure it hits the DB
                    await (Product as any).collection.updateOne(
                        { _id: product._id },
                        { $set: update }
                    );
                    updatedCount++;
                }
            } catch (err) {
                console.error(`Error updating product ${product._id}:`, err);
                errors++;
            }
        }

        return NextResponse.json({
            message: 'SEO Backfill complete',
            totalProcessed: products.length,
            updatedCount,
            errors
        });
    } catch (error: any) {
        console.error("Migration Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
