import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/all';
import { pushOrderToWebparex } from '@/lib/webparex';

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
            console.log("Webparex API Result:", result);

            // Update order with shipment info
            order.shipmentStatus = result.result === "1" ? 'Created' : 'Failed';
            order.shipmentResponse = result;
            if (result.data?.refrence_id) {
                order.shipmentOrderId = result.data.refrence_id;
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
                data: result
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
