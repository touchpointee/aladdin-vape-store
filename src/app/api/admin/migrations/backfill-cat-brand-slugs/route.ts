import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Brand from '@/models/Brand';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const categories = await Category.find({});
        const brands = await Brand.find({});

        let catUpdated = 0;
        let brandUpdated = 0;

        for (const cat of categories) {
            await cat.save();
            catUpdated++;
        }

        for (const brand of brands) {
            await brand.save();
            brandUpdated++;
        }

        return NextResponse.json({
            message: 'Category and Brand slugs backfilled',
            categoriesProcessed: catUpdated,
            brandsProcessed: brandUpdated
        });
    } catch (error: any) {
        console.error("Migration Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
