
import * as Minio from 'minio';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

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

async function optimizeImages() {
    console.log(`Connecting to bucket: ${BUCKET_NAME}`);

    try {
        const Exists = await minioClient.bucketExists(BUCKET_NAME);
        if (!Exists) {
            console.error('Bucket does not exist');
            return;
        }

        const stream = minioClient.listObjects(BUCKET_NAME, '', true);
        const largeFiles = [];

        console.log('Scanning for large files (>1MB)...');

        for await (const obj of stream) {
            if (obj.size > 1024 * 1024) { // > 1MB
                largeFiles.push(obj);
            }
        }

        console.log(`Found ${largeFiles.length} large files. Starting optimization...`);

        for (const file of largeFiles) {
            console.log(`Processing ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)...`);

            try {
                // Download
                const dataStream = await minioClient.getObject(BUCKET_NAME, file.name);
                const chunks = [];
                for await (const chunk of dataStream) {
                    chunks.push(chunk);
                }
                const buffer = Buffer.concat(chunks);

                // Optimize
                let optimizedBuffer;
                let contentType = 'image/jpeg'; // Default fallback

                // Detect type safely or just assume based on extension? 
                // Sharp handles buffer detection automatically usually.

                // Check if SVG - skip
                if (file.name.endsWith('.svg')) {
                    console.log('Skipping SVG');
                    continue;
                }

                optimizedBuffer = await sharp(buffer)
                    .resize({ width: 1920, withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toBuffer();

                // Re-upload (Overwrite with same name but WebP content? 
                // Browsers might get confused if extension is .png but content is webp.
                // Safest is to keep original format but compressed.
                // But WebP is much smaller.
                // Next/Image detects format.
                // Let's try to keep extension but compress content? Sharp can output buffer.
                // Actually, if we change content type to webp, we should change extension.
                // BUT we can't change extension because DB has the old URL.
                // 
                // TRICK: Most modern browsers/Next.js Image Optimization CAN handle mismatched content-types headers vs extension if the header is correct.
                // Let's set Content-Type to image/webp.

                // BETTER STRATEGY FOR COMPATIBILITY:
                // Just use .jpeg/.png compression effectively if we can't change extension.

                const ext = path.extname(file.name).toLowerCase();
                if (ext === '.png') {
                    optimizedBuffer = await sharp(buffer)
                        .resize({ width: 1920, withoutEnlargement: true })
                        .png({ quality: 80, compressionLevel: 9 })
                        .toBuffer();
                    contentType = 'image/png';
                } else if (ext === '.jpg' || ext === '.jpeg') {
                    optimizedBuffer = await sharp(buffer)
                        .resize({ width: 1920, withoutEnlargement: true })
                        .jpeg({ quality: 80 })
                        .toBuffer();
                    contentType = 'image/jpeg';
                } else {
                    // Fallback to WebP for others or weird formats, but keep name?
                    // Let's stick to WebP and update Content-Type. Next.js image optimizer should handle it.
                    optimizedBuffer = await sharp(buffer)
                        .resize({ width: 1920, withoutEnlargement: true })
                        .webp({ quality: 80 })
                        .toBuffer();
                    contentType = 'image/webp';
                }

                if (optimizedBuffer.length < buffer.length) {
                    await minioClient.putObject(BUCKET_NAME, file.name, optimizedBuffer, optimizedBuffer.length, {
                        'Content-Type': contentType
                    });
                    console.log(`✓ Optimized: ${(optimizedBuffer.length / 1024 / 1024).toFixed(2)} MB (was ${(file.size / 1024 / 1024).toFixed(2)} MB)`);
                } else {
                    console.log(`- Skipped: Optimization resulted in larger file.`);
                }

            } catch (err) {
                console.error(`Executed error on ${file.name}:`, err.message);
            }
        }

        console.log('Optimization complete.');

    } catch (err) {
        console.error('Error:', err);
    }
}

optimizeImages();
