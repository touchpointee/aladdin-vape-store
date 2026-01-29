import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Brand from '@/models/Brand';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const params = await props.params;
        const body = await req.json();
        const brand = await Brand.findByIdAndUpdate(params.id, body, { new: true });
        if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
        return NextResponse.json(brand);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const params = await props.params;
        const brand = await Brand.findByIdAndDelete(params.id);
        if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
        return NextResponse.json({ message: 'Brand deleted' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
