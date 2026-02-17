import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Review } from '@/models/unified';

/** GET: List all reviews, optionally filter by productId */
export async function GET(req: NextRequest) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    const query: any = {};
    if (productId) query.product = productId;

    const reviews = await Review.find(query)
        .populate('product', 'name slug')
        .sort({ createdAt: -1 })
        .lean();

    return NextResponse.json({ reviews });
}
