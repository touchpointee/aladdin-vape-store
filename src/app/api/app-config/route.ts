import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Settings } from '@/models/unified';

/**
 * Returns the API base URL for the mobile app.
 * The app calls this on startup and uses the returned URL for all API requests.
 * Change this (via env or admin setting) to point the app to a new backend without releasing an app update.
 */
export async function GET(req: NextRequest) {
    try {
        // Optional: store app_api_base_url in DB to change without redeploying backend
        await connectDB();
        const setting = await Settings.findOne({ key: 'app_api_base_url' });
        if (setting?.value) {
            const base = String(setting.value).replace(/\/$/, '');
            return NextResponse.json({ apiBaseUrl: base });
        }
    } catch {
        // ignore DB errors, fall back to env/host
    }

    // Fallback: use env or request origin
    const fromEnv = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;
    if (fromEnv) {
        const base = fromEnv.startsWith('http') ? fromEnv.replace(/\/$/, '') : `https://${fromEnv}`;
        return NextResponse.json({ apiBaseUrl: base });
    }
    const url = new URL(req.url);
    const origin = url.origin || `https://${req.headers.get('host') || 'localhost:3000'}`;
    return NextResponse.json({ apiBaseUrl: origin });
}
