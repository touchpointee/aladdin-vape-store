import * as Minio from 'minio';

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT) : 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || '',
    secretKey: process.env.MINIO_SECRET_KEY || '',
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'vape-store';

// Ensure bucket exists
export async function ensureBucket() {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
        await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');

        // Make bucket public read-only (standard for images)
        const policy = {
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: "Allow",
                    Principal: { AWS: ["*"] },
                    Action: ["s3:GetObject"],
                    Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
                },
            ],
        };
        await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
    }
}

import sharp from 'sharp';

// ... (imports)

// ... (minioClient setup)

// ... (BUCKET_NAME)

// ... (ensureBucket)

export async function uploadImage(fileBuffer: Buffer, fileName: string, contentType: string) {
    await ensureBucket();

    let bufferToUpload = fileBuffer;
    let finalContentType = contentType;
    let finalFileName = fileName;

    // Compress supported images (skip SVG)
    if (contentType.startsWith('image/') && !contentType.includes('svg')) {
        try {
            bufferToUpload = await sharp(fileBuffer)
                .resize({ width: 1920, withoutEnlargement: true }) // Limit max width to 1920px
                .webp({ quality: 80 }) // Compress to WebP with 80% quality
                .toBuffer();

            finalContentType = 'image/webp';
            // Replace extension with .webp
            finalFileName = fileName.replace(/\.[^/.]+$/, "") + ".webp";
        } catch (error) {
            console.error("Image compression failed, falling back to original", error);
        }
    }

    await minioClient.putObject(BUCKET_NAME, finalFileName, bufferToUpload, bufferToUpload.length, {
        'Content-Type': finalContentType,
    });

    // Return public URL
    const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
    const port = process.env.MINIO_PORT ? `:${process.env.MINIO_PORT}` : '';
    const host = process.env.MINIO_ENDPOINT || 'localhost';

    return `${protocol}://${host}${port}/${BUCKET_NAME}/${finalFileName}`;
}

export default minioClient;
