import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order, Product } from '@/models/unified';

export async function GET() {
    try {
        await connectDB();

        // Fetch all orders and products
        const orders = await Order.find({});
        const productsCount = await Product.countDocuments({});

        let totalSales = 0;
        const uniqueCustomers = new Set();

        orders.forEach((order: any) => {
            // Using totalPrice from Order schema
            totalSales += (order.totalPrice || 0);

            // Using phone as unique identifier since we don't have email in schema
            if (order.customer?.phone) {
                uniqueCustomers.add(order.customer.phone);
            }
        });

        return NextResponse.json({
            totalSales,
            totalOrders: orders.length,
            totalProducts: productsCount,
            totalCustomers: uniqueCustomers.size
        });

    } catch (error) {
        console.error("Failed to fetch admin stats", error);
        return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
    }
}
