import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Brand from '@/models/Brand';

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const categoryIdOrSlug = searchParams.get('category');
        const brandIdOrSlug = searchParams.get('brand');
        const isHot = searchParams.get('isHot');
        const isTopSelling = searchParams.get('isTopSelling');
        const isNewArrival = searchParams.get('isNewArrival');
        const ids = searchParams.get('ids');
        const searchQuery = searchParams.get('search');

        const query: any = { status: { $regex: '^active$', $options: 'i' } };

        if (categoryIdOrSlug) {
            if (categoryIdOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
                query.category = categoryIdOrSlug;
            } else {
                const cat = await Category.findOne({ slug: categoryIdOrSlug });
                if (cat) query.category = cat._id;
            }
        }

        if (brandIdOrSlug) {
            if (brandIdOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
                query.brand = brandIdOrSlug;
            } else {
                const brand = await Brand.findOne({ slug: brandIdOrSlug });
                if (brand) query.brand = brand._id;
            }
        }
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
