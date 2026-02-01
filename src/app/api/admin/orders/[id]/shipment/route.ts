import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/unified';
import { pushOrderToWebparex, trackOrder } from '@/lib/webparex';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const extraData = await req.json();

        const order = await Order.findById(id).populate('products.product');

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.shipmentStatus === 'Created') {
            return NextResponse.json({ error: 'Shipment already created' }, { status: 400 });
        }

        try {
            console.log("Pushing order to Webparex:", id, extraData);
            const result = await pushOrderToWebparex(order, extraData);
            console.log("Webparex API Result:", JSON.stringify(result, null, 2));

            // Update order with shipment info
            order.shipmentStatus = result.result === "1" ? 'Created' : 'Failed';
            order.shipmentResponse = result;
            if (result.data?.refrence_id) {
                order.shipmentOrderId = result.data.refrence_id;
            }
            // Store AWB number if available - check multiple possible fields
            const awb = result.data?.awb_number || result.data?.awb || result.data?.tracking_number;
            if (awb) {
                order.awbNumber = awb;
            }

            // If shipment created successfully, set initial status and try tracking
            if (result.result === "1") {
                // Set initial status to Pickup Pending when shipment is created
                order.status = 'Pickup Pending';

                // Try to get tracking status if we have AWB
                if (order.awbNumber) {
                    try {
                        const trackingResult = await trackOrder(order.awbNumber);
                        console.log("Initial tracking result:", trackingResult);

                        // Update order status if we got a mapped status
                        if (trackingResult.mappedStatus) {
                            order.status = trackingResult.mappedStatus;
                        }
                    } catch (trackError) {
                        console.log("Initial tracking failed (non-critical):", trackError);
                        // Non-critical: keep status as Pickup Pending
                    }
                }
            }


            console.log("Saving order with shipment info...");
            await order.save();
            console.log("Order saved successfully");

            if (result.result !== "1") {
                return NextResponse.json({
                    error: result.message || 'Webparex API returned an error',
                    data: result
                }, { status: 400 });
            }

            return NextResponse.json({
                message: 'Shipment created successfully',
                data: result,
                awbNumber: order.awbNumber
            });

        } catch (apiError: any) {
            console.error("Detailed Webparex API Error:", apiError);

            const errorMsg = apiError.message || 'Failed to communicate with Webparex API';

            // Log failure in DB if possible
            try {
                order.shipmentStatus = 'Failed';
                order.shipmentResponse = {
                    error: errorMsg,
                    stack: apiError.stack,
                    timestamp: new Date().toISOString()
                };
                await order.save();
            } catch (saveError) {
                console.error("Failed to save error status to DB:", saveError);
            }

            return NextResponse.json({
                error: errorMsg
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Server Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
