import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;

    // CORS for API (Expo web localhost:8081/8082, mobile app, etc.)
    if (path.startsWith('/api')) {
        if (req.method === 'OPTIONS') {
            return new NextResponse(null, { status: 204, headers: corsHeaders });
        }
        const res = NextResponse.next();
        Object.entries(corsHeaders).forEach(([key, value]) => res.headers.set(key, value));
        return res;
    }

    // Only protect /admin routes
    if (path.startsWith('/admin')) {
        // Allow public access to login page
        if (path === '/admin/login') {
            return NextResponse.next();
        }

        const token = req.cookies.get('admin_token')?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }

        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-it');
            await jwtVerify(token, secret);
            return NextResponse.next();
        } catch (error) {
            // Invalid Token
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/api/:path*', '/admin/:path*'],
};
