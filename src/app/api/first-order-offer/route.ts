import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/unified';

/**
 * GET ?installId=xxx&phone=yyy (phone optional)
 * Returns { eligible: boolean } for app first-order 10% offer.
 * Eligible when: no app order with this installId, and (if phone given) no app order with this phone.
 */
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const installId = searchParams.get('installId')?.trim();
        const phone = searchParams.get('phone')?.trim().replace(/\D/g, '');

        if (!installId) {
            return NextResponse.json({ eligible: false });
        }

        const query: any = { orderSource: 'app' };
        const orConditions: any[] = [{ installId }];
        if (phone && phone.length === 10) {
            orConditions.push({ 'customer.phone': phone });
        }
        query.$or = orConditions;

        const count = await Order.countDocuments(query);
        return NextResponse.json({ eligible: count === 0 });
    } catch (e) {
        return NextResponse.json({ eligible: false }, { status: 500 });
    }
}
