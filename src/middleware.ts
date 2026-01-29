import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;

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
    matcher: ['/admin/:path*'],
};
