import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Product } from '@/models/all';
import { uploadImage } from '@/lib/minio';

// GET: List all products (with optional filters)
export async function GET(req: NextRequest) {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('category');
    const brandId = searchParams.get('brand');
    const isHot = searchParams.get('isHot');

    const query: any = { status: 'active' };
    if (categoryId) query.category = categoryId;
    if (brandId) query.brand = brandId;
    if (isHot === 'true') query.isHot = true;

    try {
        const products = await Product.find(query)
            .populate('category')
            .populate('brand')
            .sort({ createdAt: -1 });

        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

// POST: Create a new product with multiple images
export async function POST(req: NextRequest) {
    await connectDB();
    try {
        const formData = await req.formData();

        // Extract basic fields
        const name = formData.get('name') as string;
        const slug = formData.get('slug') as string;
        const price = parseFloat(formData.get('price') as string);
        const stock = parseInt(formData.get('stock') as string);
        const category = formData.get('category') as string;

        // Optional fields
        const description = formData.get('description') as string || '';
        const discountPrice = formData.get('discountPrice') ? parseFloat(formData.get('discountPrice') as string) : undefined;
        const puffCount = formData.get('puffCount') as string || undefined;
        const brand = formData.get('brand') as string || undefined;
        const isHot = formData.get('isHot') === 'true';
        const isTopSelling = formData.get('isTopSelling') === 'true';
        const isNewArrival = formData.get('isNewArrival') === 'true';

        // Validation
        if (!name || !slug || !price || !category || !stock) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Handle Image Uploads (images[0], images[1], etc.)
        const imageUrls: string[] = [];
        const files = Array.from(formData.entries())
            .filter(([key]) => key.startsWith('images'))
            .map(([, file]) => file as File);

        for (const file of files) {
            if (file.size > 0) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
                const url = await uploadImage(buffer, fileName, file.type);
                imageUrls.push(url);
            }
        }

        const product = await Product.create({
            name,
            slug,
            description,
            price,
            discountPrice,
            stock,
            puffCount,
            category,
            brand,
            isHot,
            isTopSelling,
            isNewArrival,
            images: imageUrls,
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Slug must be unique' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
    }
}
// PUT: Update an existing product
export async function PUT(req: NextRequest) {
    await connectDB();
    try {
        const formData = await req.formData();
        const _id = formData.get('_id') as string;

        if (!_id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const updateData: any = {};

        // Helper to conditionally add fields
        const setIfPresent = (key: string, parser: (v: string) => any = v => v) => {
            if (formData.has(key)) {
                updateData[key] = parser(formData.get(key) as string);
            }
        };

        setIfPresent('name');
        setIfPresent('slug');
        setIfPresent('description');
        setIfPresent('price', parseFloat);
        setIfPresent('discountPrice', parseFloat);
        setIfPresent('stock', parseInt);
        setIfPresent('puffCount'); // Keep as string or int? Model says String.
        setIfPresent('category');
        setIfPresent('brand');

        // Boolean fields - formData sends 'true'/'false' or nothing?
        // UI sends 'true'/'false'.
        if (formData.has('isHot')) updateData.isHot = formData.get('isHot') === 'true';
        if (formData.has('isTopSelling')) updateData.isTopSelling = formData.get('isTopSelling') === 'true';
        if (formData.has('isNewArrival')) updateData.isNewArrival = formData.get('isNewArrival') === 'true';

        // Handle Images
        // 1. Get kept existing images
        const existingImages = formData.getAll('existingImages') as string[];

        // 2. Process new uploads
        const newImageUrls: string[] = [];
        const files = Array.from(formData.entries())
            .filter(([key]) => key.startsWith('images'))
            .map(([, file]) => file as File);

        for (const file of files) {
            if (file.size > 0) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
                const url = await uploadImage(buffer, fileName, file.type);
                newImageUrls.push(url);
            }
        }

        // 3. Combine to replace the images array
        // Only update images if we are either adding new ones OR we have explicitly sent existing ones (meaning potential deletion)
        // If the user didn't touch images, existingImages might be empty if the frontend doesn't send them? 
        // Logic: The frontend MUST send 'existingImages' if it intends to keep them.

        const finalImages = [...existingImages, ...newImageUrls];
        updateData.images = finalImages;

        const product = await Product.findByIdAndUpdate(_id, { $set: updateData }, { new: true });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
    }
}
