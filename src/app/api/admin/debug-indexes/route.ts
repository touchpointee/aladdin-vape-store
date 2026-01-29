import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export async function GET() {
    await connectDB();
    try {
        if (!mongoose.connection.db) {
            return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
        }
        const db = mongoose.connection.db;

        const catIndexes = await db.collection('categories').indexes();
        const brandIndexes = await db.collection('brands').indexes();

        return NextResponse.json({
            categoryIndexes: catIndexes,
            brandIndexes: brandIndexes
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
