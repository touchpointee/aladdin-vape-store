import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/unified';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();

        // Find the most recent order
        const latestOrder = await Order.findOne({})
            .select('_id createdAt')
            .sort({ createdAt: -1 });

        if (!latestOrder) {
            return NextResponse.json({
                latestOrderId: null,
                createdAt: null
            });
        }

        return NextResponse.json({
            latestOrderId: latestOrder._id,
            createdAt: latestOrder.createdAt
        });

    } catch (error: any) {
        console.error("Error fetching latest order:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
