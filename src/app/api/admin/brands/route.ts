import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Brand from '@/models/Brand';
import { uploadImage } from '@/lib/minio';

// Re-written to fix build error
// GET: List all brands
export async function GET() {
    await connectDB();
    try {
        const brands = await Brand.find().sort({ createdAt: -1 });
        return NextResponse.json(brands);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
    }
}

// POST: Create a new brand with logo
export async function POST(req: NextRequest) {
    await connectDB();
    try {
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const slug = formData.get('slug') as string;
        const file = formData.get('logo') as File;

        if (!name || !slug) {
            return NextResponse.json({ error: 'Name and Slug are required' }, { status: 400 });
        }

        let logoUrl = '';
        if (file) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileName = `brands/${Date.now()}-${file.name}`;
            logoUrl = await uploadImage(buffer, fileName, file.type);
        }

        const brand = await Brand.create({
            name,
            slug,
            logo: logoUrl,
        });

        return NextResponse.json(brand, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Slug must be unique' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || 'Failed to create brand' }, { status: 500 });
    }
}

// PUT: Update a brand
export async function PUT(req: NextRequest) {
    await connectDB();
    try {
        const formData = await req.formData();
        const _id = formData.get('_id') as string;
        const name = formData.get('name') as string;
        const slug = formData.get('slug') as string;
        const file = formData.get('logo') as File;

        if (!_id) {
            return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (slug) updateData.slug = slug;

        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileName = `brands/${Date.now()}-${file.name}`;
            const logoUrl = await uploadImage(buffer, fileName, file.type);
            updateData.logo = logoUrl;
        }

        const brand = await Brand.findByIdAndUpdate(_id, { $set: updateData }, { new: true });

        if (!brand) {
            return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
        }

        return NextResponse.json(brand);
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Slug must be unique' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || 'Failed to update brand' }, { status: 500 });
    }
}
