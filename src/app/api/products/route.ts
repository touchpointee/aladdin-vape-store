import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get('category');
        const brandId = searchParams.get('brand');
        const isHot = searchParams.get('isHot');
        const isTopSelling = searchParams.get('isTopSelling');
        const isNewArrival = searchParams.get('isNewArrival');
        const ids = searchParams.get('ids');
        const searchQuery = searchParams.get('search');

        const query: any = { status: { $regex: '^active$', $options: 'i' } };
        if (categoryId) query.category = categoryId;
        if (brandId) query.brand = brandId;
        if (isHot === 'true') query.isHot = true;
        if (isTopSelling === 'true') query.isTopSelling = true;
        if (isNewArrival === 'true') query.isNewArrival = true;

        if (ids && ids.trim()) {
            const idList = ids.split(',').filter(id => id.trim().length === 24 || id.trim().length === 12);
            if (idList.length > 0) {
                query._id = { $in: idList };
            } else if (ids.includes(',')) {
                // If ids were provided but all invalid, return nothing
                return NextResponse.json({ products: [], pagination: { total: 0, page: 1, limit: 30, pages: 0 } });
            }
        }

        if (searchQuery) {
            query.$or = [
                { name: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } }
            ];
        }

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '30');
        const skip = (page - 1) * limit;

        const products = await Product.find(query)
            .populate('category')
            .populate('brand')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments(query);

        return NextResponse.json({
            products: Array.isArray(products) ? products : [],
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        console.error("Products API Error:", error);
        return NextResponse.json({
            products: [],
            pagination: { total: 0, page: 1, limit: 30, pages: 0 },
            error: error.message
        }, { status: 500 });
    }
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
