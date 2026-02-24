import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Product } from '@/models/unified';
import mongoose from 'mongoose';

/**
 * Fix duplicate product slugs so each product has a unique slug (SEO-friendly URLs).
 * For each slug that appears on more than one product, keeps the first product's slug
 * and appends "-{last6OfId}" to the rest (e.g. blue-razz → blue-razz, blue-razz-abc123).
 * Run once after deploying unique-slug logic, or when you see wrong product on detail page.
 */
export async function POST() {
    try {
        await connectDB();

        const products = await Product.find({}).select('_id slug name').lean();
        const bySlug = new Map<string, { _id: string; name: string }[]>();

        for (const p of products) {
            const slug = (p as any).slug?.trim();
            if (!slug) continue;
            if (!bySlug.has(slug)) bySlug.set(slug, []);
            bySlug.get(slug)!.push({ _id: (p as any)._id.toString(), name: (p as any).name });
        }

        let updatedCount = 0;
        for (const [slug, items] of bySlug.entries()) {
            if (items.length <= 1) continue;
            items.sort((a, b) => a._id.localeCompare(b._id));
            for (let i = 1; i < items.length; i++) {
                const productId = items[i]._id;
                const newSlug = `${slug}-${productId.slice(-6)}`;
                await (Product as any).collection.updateOne(
                    { _id: new mongoose.Types.ObjectId(productId) },
                    { $set: { slug: newSlug } }
                );
                updatedCount++;
            }
        }

        return NextResponse.json({
            message: 'Unique product slugs backfill complete',
            duplicateSlugsFixed: updatedCount,
        });
    } catch (error: any) {
        console.error('Backfill unique slugs error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
