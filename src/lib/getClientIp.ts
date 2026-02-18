import { NextRequest } from 'next/server';

/**
 * Get client IP from request (supports x-forwarded-for, x-real-ip, cf-connecting-ip).
 */
export function getClientIp(req: NextRequest): string | null {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
        const first = forwarded.split(',')[0]?.trim();
        if (first) return first;
    }
    const real = req.headers.get('x-real-ip');
    if (real) return real.trim();
    const cf = req.headers.get('cf-connecting-ip');
    if (cf) return cf.trim();
    return null;
}
