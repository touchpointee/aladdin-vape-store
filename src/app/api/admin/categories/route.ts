import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import { uploadImage } from '@/lib/minio';

// Re-written to fix build error
// GET: List all categories
export async function GET() {
    await connectDB();
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

// POST: Create a new category with image
export async function POST(req: NextRequest) {
    await connectDB();
    try {
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const file = formData.get('image') as File;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        let imageUrl = '';
        if (file) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileName = `categories/${Date.now()}-${file.name}`;
            imageUrl = await uploadImage(buffer, fileName, file.type);
        }

        const category = await Category.create({
            name,
            description,
            image: imageUrl,
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: `Duplicate entry: ${JSON.stringify(error.keyValue)}` }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
    }
}

// PUT: Update a category
export async function PUT(req: NextRequest) {
    await connectDB();
    try {
        const formData = await req.formData();
        const _id = formData.get('_id') as string;
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const file = formData.get('image') as File;

        if (!_id) {
            return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;

        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileName = `categories/${Date.now()}-${file.name}`;
            const imageUrl = await uploadImage(buffer, fileName, file.type);
            updateData.image = imageUrl;
        }

        const category = await Category.findByIdAndUpdate(_id, { $set: updateData }, { new: true });

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json(category);
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: `Duplicate entry: ${JSON.stringify(error.keyValue)}` }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || 'Failed to update category' }, { status: 500 });
    }
}
