import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { Review, Product } from '@/models/unified';

/** GET: List approved reviews for a product + average rating */
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    await connectDB();
    const params = await props.params;
    const productId = params.id;
    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const reviews = await Review.find({ product: productId, status: 'approved' })
        .sort({ createdAt: -1 })
        .lean();

    const total = reviews.length;
    const averageRating = total > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / total
        : 0;
    const rounded = Math.round(averageRating * 10) / 10;

    return NextResponse.json({
        reviews,
        averageRating: rounded,
        total,
    });
}

/** POST: Add or update review (one per customerId per product). customerId required (e.g. guest:uuid). */
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const params = await props.params;
        const productId = params.id;
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
        }
        const product = await Product.findById(productId);
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        let body: { rating: number; comment?: string; authorName?: string; customerId: string };
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        const { rating, comment = '', authorName = 'Guest', customerId } = body;
        if (!customerId || typeof customerId !== 'string' || !customerId.trim()) {
            return NextResponse.json({ error: 'customerId is required (e.g. guest:uuid)' }, { status: 400 });
        }
        const cid = customerId.trim();
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'rating must be 1-5' }, { status: 400 });
        }

        const productObjId = new mongoose.Types.ObjectId(productId);
        const review = await Review.findOneAndUpdate(
            { product: productObjId, customerId: cid },
            {
                $set: {
                    rating,
                    comment: String(comment || '').trim().slice(0, 2000),
                    authorName: String(authorName || 'Guest').trim().slice(0, 100),
                    status: 'approved',
                },
            },
            { new: true, upsert: true }
        );

        return NextResponse.json(review);
    } catch (err: any) {
        console.error('Review POST error:', err);
        return NextResponse.json(
            { error: err?.message || 'Failed to save review' },
            { status: 500 }
        );
    }
}
