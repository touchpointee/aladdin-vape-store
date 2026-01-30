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
                // Trigger pre-save hook by calling save()
                // The hook will generate slug, metaTitle, and metaDescription if missing
                await product.save();
                updatedCount++;
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
