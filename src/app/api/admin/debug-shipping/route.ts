import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/unified';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();

        // Fetch all orders with shipment created
        const orders = await Order.find({ shipmentStatus: 'Created' })
            .select('_id customer.name status awbNumber shipmentOrderId shipmentResponse createdAt')
            .sort({ createdAt: -1 })
            .limit(20);

        return NextResponse.json({
            count: orders.length,
            orders: orders.map(o => ({
                id: o._id,
                name: o.customer.name,
                status: o.status,
                awb: o.awbNumber,
                hasAwb: !!o.awbNumber,
                awbType: typeof o.awbNumber,
                shipmentId: o.shipmentOrderId,
                shipmentResponse: o.shipmentResponse,
                created: o.createdAt
            }))
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
