import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { Product, Category, Brand, Review } from "@/models/unified";

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
        const sortParam = searchParams.get('sort');
        let sort: any = { createdAt: -1 };
        if (sortParam === 'price_asc') sort = { price: 1 };
        else if (sortParam === 'price_desc') sort = { price: -1 };

        const products = await Product.find(query)
            .populate('category')
            .populate('brand')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Product.countDocuments(query);

        const productIds = (products as any[]).map((p) => {
            const id = p._id;
            return id && typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
        }).filter(Boolean);
        const reviewStats = await Review.aggregate([
            { $match: { product: { $in: productIds }, status: { $in: ['approved'] } } },
            { $group: { _id: '$product', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
        ]);
        const statsByProduct: Record<string, { averageRating: number; reviewCount: number }> = {};
        reviewStats.forEach((s: any) => {
            const key = s._id != null ? String(s._id) : '';
            if (key) statsByProduct[key] = {
                averageRating: Math.round((Number(s.averageRating) || 0) * 10) / 10,
                reviewCount: Number(s.reviewCount) || 0,
            };
        });

        const productsWithRating = (products as any[]).map((p) => {
            const id = p._id != null ? String(p._id) : '';
            const stats = id ? statsByProduct[id] : undefined;
            return {
                ...p,
                averageRating: stats?.averageRating ?? null,
                reviewCount: stats?.reviewCount ?? 0,
            };
        });

        const res = NextResponse.json({
            products: productsWithRating,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
        res.headers.set('Cache-Control', 'no-store, max-age=0');
        return res;
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
