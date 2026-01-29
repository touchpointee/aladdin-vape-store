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

export async function uploadImage(fileBuffer: Buffer, fileName: string, contentType: string) {
    await ensureBucket();
    await minioClient.putObject(BUCKET_NAME, fileName, fileBuffer, fileBuffer.length, {
        'Content-Type': contentType,
    });

    // Return public URL
    const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
    const port = process.env.MINIO_PORT ? `:${process.env.MINIO_PORT}` : '';
    // Note: If running locally with Docker, you might need localhost, 
    // but if accessing from browser, you need the public address.
    // For now, constructing generic URL.
    return `${protocol}://${process.env.MINIO_ENDPOINT}${port}/${BUCKET_NAME}/${fileName}`;
}

export default minioClient;
