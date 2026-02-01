import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Settings } from '@/models/unified';

export async function GET(req: NextRequest) {
    await connectDB();
    try {
        const { searchParams } = new URL(req.url);
        const key = searchParams.get('key');

        // If specific key is requested, return just that setting
        if (key) {
            const setting = await Settings.findOne({ key });
            if (!setting) return NextResponse.json({ value: null });
            // Try to parse JSON, if fails return string value
            try {
                return NextResponse.json({ value: JSON.parse(setting.value) });
            } catch {
                return NextResponse.json({ value: setting.value });
            }
        }

        // Default: return common settings
        const logoSetting = await Settings.findOne({ key: 'site_logo' });
        const whatsappSetting = await Settings.findOne({ key: 'whatsapp_number' });
        const qrCodeSetting = await Settings.findOne({ key: 'payment_qr_code' });

        return NextResponse.json({
            site_logo: logoSetting ? logoSetting.value : '/logo.jpg',
            whatsapp_number: whatsappSetting ? whatsappSetting.value : '',
            payment_qr_code: qrCodeSetting ? qrCodeSetting.value : '',
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}
