import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function GET(req: NextRequest) {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('category');
    const brandId = searchParams.get('brand');
    const isHot = searchParams.get('isHot');
    const isTopSelling = searchParams.get('isTopSelling');
    const isNewArrival = searchParams.get('isNewArrival');
    const ids = searchParams.get('ids'); // Comma separated
    const searchQuery = searchParams.get('search'); // Search Query

    const query: any = { status: { $regex: '^active$', $options: 'i' } };
    if (categoryId) query.category = categoryId;
    if (brandId) query.brand = brandId;
    if (isHot === 'true') query.isHot = true;
    if (isTopSelling === 'true') query.isTopSelling = true;
    if (isNewArrival === 'true') query.isNewArrival = true;
    if (ids) {
        query._id = { $in: ids.split(',') };
    }
    if (searchQuery) {
        query.$or = [
            { name: { $regex: searchQuery, $options: 'i' } },
            { description: { $regex: searchQuery, $options: 'i' } }
        ];
    }

    const products = await Product.find(query)
        .populate('category')
        .populate('brand')
        .sort({ createdAt: -1 });

    return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const product = await Product.create(body);
        return NextResponse.json(product, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
