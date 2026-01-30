import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Settings } from '@/models/all';

export async function GET(req: NextRequest) {
    await connectDB();
    try {
        const logoSetting = await Settings.findOne({ key: 'site_logo' });
        const whatsappSetting = await Settings.findOne({ key: 'whatsapp_number' });

        return NextResponse.json({
            site_logo: logoSetting ? logoSetting.value : '/logo.jpg',
            whatsapp_number: whatsappSetting ? whatsappSetting.value : '',
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}
