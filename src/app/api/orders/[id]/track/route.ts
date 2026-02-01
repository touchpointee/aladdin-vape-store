import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/unified';
import { trackOrder } from '@/lib/webparex';

// Public API to get order tracking status
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const order = await Order.findById(id).select('status awbNumber shipmentStatus');

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // If order has AWB and shipment created, try to get live tracking
        if (order.awbNumber && order.shipmentStatus === 'Created' &&
            order.status !== 'Cancelled' && order.status !== 'Delivered') {
            try {
                const trackingResult = await trackOrder(order.awbNumber);

                // Update order status if we got a valid status from courier
                if (trackingResult.mappedStatus && trackingResult.mappedStatus !== order.status) {
                    order.status = trackingResult.mappedStatus;
                    await order.save();
                }

                return NextResponse.json({
                    status: order.status,
                    awbNumber: order.awbNumber,
                    courierStatus: trackingResult.currentStatus,
                    courier: trackingResult.courier,
                    expectedDelivery: trackingResult.expectedDelivery,
                    liveTracking: true
                });
            } catch (trackError) {
                // If tracking fails, just return stored status
                console.log("Tracking API error:", trackError);
            }
        }

        // Return stored status
        return NextResponse.json({
            status: order.status,
            awbNumber: order.awbNumber || null,
            liveTracking: false
        });

    } catch (error: any) {
        console.error("Error:", error);
        return NextResponse.json({ error: 'Failed to fetch tracking' }, { status: 500 });
    }
}
