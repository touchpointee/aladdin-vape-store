import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/unified';
import { trackOrder } from '@/lib/webparex';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        await connectDB();

        // Find active orders that have an AWB number and are not yet delivered/cancelled
        const orders = await Order.find({
            awbNumber: { $exists: true, $ne: '' },
            status: { $nin: ['Delivered', 'Cancelled', 'Returned'] },
            // Optional: Limit to recent orders to avoid checking very old ones
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        });

        if (orders.length === 0) {
            return NextResponse.json({ message: 'No active orders to sync', count: 0 });
        }

        let updatedCount = 0;
        let errors = 0;
        const results = [];

        // Process sequentially to be gentle on the external API
        for (const order of orders) {
            try {
                // Add a small delay between requests if needed, e.g., 500ms
                // await new Promise(r => setTimeout(r, 500)); 

                const trackingResult = await trackOrder(order.awbNumber!);

                if (trackingResult.mappedStatus && trackingResult.mappedStatus !== order.status) {
                    order.status = trackingResult.mappedStatus;
                    // Also update history/timeline if you have that logic, for now just status
                    await order.save();
                    updatedCount++;
                    results.push({ id: order._id, status: order.status, success: true });
                } else {
                    results.push({ id: order._id, status: order.status, success: true, message: 'No status change' });
                }
            } catch (err: any) {
                console.error(`Failed to track order ${order._id}:`, err);
                errors++;
                results.push({ id: order._id, success: false, error: err.message });
            }
        }

        return NextResponse.json({
            message: `Sync completed. Updated ${updatedCount} orders.`,
            totalProcessed: orders.length,
            updatedCount,
            errors,
            details: results
        });

    } catch (error: any) {
        console.error("Sync Error:", error);
        return NextResponse.json({ error: 'Internal server error during sync' }, { status: 500 });
    }
}
