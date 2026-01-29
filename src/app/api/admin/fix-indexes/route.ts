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

        let messages = [];

        // Drop index on categories
        const categories = db.collection('categories');
        if (categories) {
            try {
                const catIndexes = await categories.indexes();
                const catSlugIndex = catIndexes.find((i: any) => i.key.slug);
                if (catSlugIndex && catSlugIndex.name) {
                    await categories.dropIndex(catSlugIndex.name);
                    messages.push(`Dropped category index: ${catSlugIndex.name}`);
                } else {
                    messages.push('No slug index found on categories');
                }
            } catch (e: any) {
                messages.push(`Error dropping category index: ${e.message}`);
            }
        }

        // Drop index on brands
        const brands = db.collection('brands');
        if (brands) {
            try {
                const brandIndexes = await brands.indexes();
                const brandSlugIndex = brandIndexes.find((i: any) => i.key.slug);
                if (brandSlugIndex && brandSlugIndex.name) {
                    await brands.dropIndex(brandSlugIndex.name);
                    messages.push(`Dropped brand index: ${brandSlugIndex.name}`);
                } else {
                    messages.push('No slug index found on brands');
                }
            } catch (e: any) {
                messages.push(`Error dropping brand index: ${e.message}`);
            }
        }

        // Drop index on products
        const products = db.collection('products');
        if (products) {
            try {
                const productIndexes = await products.indexes();
                const productSlugIndex = productIndexes.find((i: any) => i.key.slug);
                if (productSlugIndex && productSlugIndex.name) {
                    await products.dropIndex(productSlugIndex.name);
                    messages.push(`Dropped product index: ${productSlugIndex.name}`);
                } else {
                    messages.push('No slug index found on products');
                }
            } catch (e: any) {
                messages.push(`Error dropping product index: ${e.message}`);
            }
        }

        return NextResponse.json({ message: 'Index cleanup attempted', details: messages });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
