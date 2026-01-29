import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const params = await props.params;
        const body = await req.json();
        const category = await Category.findByIdAndUpdate(params.id, body, { new: true });
        if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        return NextResponse.json(category);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const params = await props.params;
        const category = await Category.findByIdAndDelete(params.id);
        if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        return NextResponse.json({ message: 'Category deleted' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
