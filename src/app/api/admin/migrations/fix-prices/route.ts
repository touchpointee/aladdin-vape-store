
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/all';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Find all orders
        const orders = await Order.find({});

        let fixedCount = 0;
        let checkedCount = 0;
        const updates = [];

        for (const order of orders) {
            checkedCount++;

            try {
                if (!order.products || !Array.isArray(order.products)) {
                    console.warn(`Order ${order._id} has no products array. Skipping.`);
                    continue;
                }

                // Calculate correct total from items
                // Note: We use the stored price in the products array, which represents the price at purchase time.
                // This is safer than looking up current product prices.
                const correctTotal = order.products.reduce((acc: number, item: any) => {
                    const price = Number(item.price) || 0;
                    const quantity = Number(item.quantity) || 0;
                    return acc + (price * quantity);
                }, 0);

                // Check if stored total is different
                if (order.totalPrice !== correctTotal) {
                    console.log(`Fixing Order ${order._id}: Old Total ${order.totalPrice} -> New Total ${correctTotal}`);

                    // Update the order directly to bypass Mongoose validation (missing required fields in old data)
                    updates.push(Order.updateOne(
                        { _id: order._id },
                        { $set: { totalPrice: correctTotal } }
                    ));
                    fixedCount++;
                }
            } catch (err: any) {
                console.error(`Error processing order ${order._id}:`, err);
            }
        }

        // Wait for all updates to complete
        await Promise.all(updates);

        return NextResponse.json({
            success: true,
            message: `Migration complete. Checked ${checkedCount} orders. Fixed ${fixedCount} orders.`,
            details: {
                checked: checkedCount,
                fixed: fixedCount
            }
        });

    } catch (error: any) {
        console.error("Migration failed:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
