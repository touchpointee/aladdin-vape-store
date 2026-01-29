import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    await connectDB();
    const params = await props.params;
    const product = await Product.findById(params.id).populate('category').populate('brand');
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const params = await props.params;
        const body = await req.json();
        const product = await Product.findByIdAndUpdate(params.id, body, { new: true });
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        return NextResponse.json(product);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const params = await props.params;
        const product = await Product.findByIdAndDelete(params.id);
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        return NextResponse.json({ message: 'Product deleted' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
