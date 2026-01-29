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

        await ensureBucket();

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${uuidv4()}-${file.name.replace(/\s+/g, '-')}`;

        // Upload to MinIO
        await minioClient.putObject(bucketName, filename, buffer, buffer.length, {
            'Content-Type': file.type,
        });

        // Public URL logic (assuming public bucket policy)
        // If MinIO is running locally, we need to construct the URL carefully.
        // For localhost, it might differ from production.
        // Here we construct a URL based on the environment config.
        const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
        const host = process.env.MINIO_ENDPOINT || 'localhost';
        const port = process.env.MINIO_PORT || '9000';

        // Use the proxy/access URL if specifically defined, otherwise construct it
        // Note: For images to be viewable in browser, the bucket must have public read policy (set in ensureBucketExists)
        const url = `${protocol}://${host}:${port}/${bucketName}/${filename}`;

        return NextResponse.json({ url });
    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
