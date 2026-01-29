import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Settings } from '@/models/all';
import { uploadImage } from '@/lib/minio';

export async function GET(req: NextRequest) {
    await connectDB();
    try {
        const { searchParams } = new URL(req.url);
        const key = searchParams.get('key');

        if (key) {
            const setting = await Settings.findOne({ key });
            if (!setting) return NextResponse.json({});
            // Try to parse JSON, if fails return string value
            try {
                return NextResponse.json({ value: JSON.parse(setting.value) });
            } catch {
                return NextResponse.json({ value: setting.value });
            }
        }

        // Default behavior for the settings page: return all relevant settings
        const bannerSettings = await Settings.findOne({ key: 'home_banners' });
        const whatsappSettings = await Settings.findOne({ key: 'whatsapp_number' });

        return NextResponse.json({
            banner1: bannerSettings ? JSON.parse(bannerSettings.value).banner1 : null,
            banner2: bannerSettings ? JSON.parse(bannerSettings.value).banner2 : null,
            whatsapp_number: whatsappSettings ? whatsappSettings.value : '',
        });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    await connectDB();
    try {
        const formData = await req.formData();

        // 1. Handle General Settings (WhatsApp)
        if (formData.has('whatsapp_number')) {
            await Settings.findOneAndUpdate(
                { key: 'whatsapp_number' },
                { value: formData.get('whatsapp_number') as string },
                { upsert: true }
            );
        }

        // 2. Handle Banner Settings (only if banner fields are present)
        if (formData.has('banner1_link') || formData.has('banner2_link')) { // Basic check if we are saving banners

            // Fetch existing settings to merge or keep existing images if not replaced
            let currentBanners = {};
            const existingDoc = await Settings.findOne({ key: 'home_banners' });
            if (existingDoc) {
                currentBanners = JSON.parse(existingDoc.value);
            }

            const processBanner = async (prefix: string) => {
                const file = formData.get(`${prefix}_image`) as File;
                let imageUrl = (currentBanners as any)[prefix]?.image || '';

                if (file && file.size > 0) {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const fileName = `banners/${Date.now()}-${prefix}-${file.name}`;
                    imageUrl = await uploadImage(buffer, fileName, file.type);
                }

                return {
                    image: imageUrl,
                    link: formData.get(`${prefix}_link`) as string || '',
                    title: formData.get(`${prefix}_title`) as string || '',
                    subtitle: formData.get(`${prefix}_subtitle`) as string || '',
                    badge: formData.get(`${prefix}_badge`) as string || '',
                };
            };

            const banner1 = await processBanner('banner1');
            const banner2 = await processBanner('banner2');

            const newSettings = { banner1, banner2 };

            await Settings.findOneAndUpdate(
                { key: 'home_banners' },
                { value: JSON.stringify(newSettings) },
                { upsert: true, new: true }
            );
        }

        return NextResponse.json({ message: 'Settings updated' });
    } catch (error: any) {
        console.error('Settings update error:', error);
        return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 });
    }
}
