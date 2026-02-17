import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Settings } from '@/models/unified';

/**
 * Returns the API base URL for the mobile app.
 * The app calls this on startup and uses the returned URL for all API requests.
 * Change this (via env or admin setting) to point the app to a new backend without releasing an app update.
 */
function isLocalhost(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    try {
        const u = new URL(url);
        return /^localhost$/i.test(u.hostname) || u.hostname === '127.0.0.1';
    } catch {
        return /localhost|127\.0\.0\.1/i.test(url);
    }
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const setting = await Settings.findOne({ key: 'app_api_base_url' });
        if (setting?.value) {
            const base = String(setting.value).trim().replace(/\/+$/, '');
            if (base && !isLocalhost(base)) return NextResponse.json({ apiBaseUrl: base });
        }
    } catch {
        // ignore DB errors, fall back to env/host
    }

    const fromEnv = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;
    if (fromEnv) {
        const base = fromEnv.startsWith('http') ? fromEnv.replace(/\/$/, '') : `https://${fromEnv}`;
        if (!isLocalhost(base)) return NextResponse.json({ apiBaseUrl: base });
    }

    const url = new URL(req.url);
    const host = req.headers.get('host') || '';
    const origin = url.origin || (host ? (url.protocol === 'https:' ? 'https://' : 'http://') + host : '');
    if (origin && !isLocalhost(origin)) return NextResponse.json({ apiBaseUrl: origin });
    return NextResponse.json({ apiBaseUrl: '' });
}
