import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/all';
import { trackOrder } from '@/lib/webparex';

// GET: Fetch tracking status from courier and update order
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const order = await Order.findById(id);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (!order.awbNumber) {
            return NextResponse.json({ error: 'No AWB number found for this order' }, { status: 400 });
        }

        try {
            const trackingResult = await trackOrder(order.awbNumber);

            // Update order status if we got a valid status from courier
            if (trackingResult.mappedStatus && order.status !== 'Cancelled') {
                order.status = trackingResult.mappedStatus;
                await order.save();
            }

            return NextResponse.json({
                message: 'Tracking updated successfully',
                awbNumber: order.awbNumber,
                currentStatus: trackingResult.currentStatus,
                orderStatus: order.status,
                expectedDelivery: trackingResult.expectedDelivery,
                courier: trackingResult.courier,
                trackingData: trackingResult.data
            });

        } catch (apiError: any) {
            console.error("Tracking API Error:", apiError);
            return NextResponse.json({
                error: apiError.message || 'Failed to fetch tracking info'
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Server Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
