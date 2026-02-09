import { NextRequest, NextResponse } from 'next/server';
import minioClient, { ensureBucket, uploadImage } from '@/lib/minio';
import { v4 as uuidv4 } from 'uuid';

const bucketName = process.env.MINIO_BUCKET_NAME || 'uploads';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${uuidv4()}-${file.name.replace(/\s+/g, '-')}`;

        // Use helper which now includes compression
        const url = await uploadImage(buffer, filename, file.type);

        return NextResponse.json({ url });
    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
