import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Brand } from '@/models/unified';

export async function GET() {
    await connectDB();
    const brands = await Brand.find({}).sort({ createdAt: -1 });
    return NextResponse.json(brands);
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const brand = await Brand.create(body);
        return NextResponse.json(brand, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
