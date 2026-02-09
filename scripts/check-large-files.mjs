
import * as Minio from 'minio';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local' });

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT) : 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || '',
    secretKey: process.env.MINIO_SECRET_KEY || '',
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'uploads';

async function checkLargeFiles() {
    console.log(`Connecting to bucket: ${BUCKET_NAME}`);

    try {
        const Exists = await minioClient.bucketExists(BUCKET_NAME);
        if (!Exists) {
            console.error('Bucket does not exist');
            return;
        }

        const stream = minioClient.listObjects(BUCKET_NAME, '', true);
        const largeFiles = [];

        console.log('Scanning for files > 2MB...');

        for await (const obj of stream) {
            if (obj.size > 2 * 1024 * 1024) { // > 2MB
                largeFiles.push(obj);
            }
        }

        if (largeFiles.length === 0) {
            console.log('✅ No files larger than 2MB found.');
        } else {
            console.log(`⚠️ Found ${largeFiles.length} files larger than 2MB:`);
            largeFiles.forEach(file => {
                console.log(`- ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
            });
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

checkLargeFiles();
