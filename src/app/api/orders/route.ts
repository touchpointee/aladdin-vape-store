import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order, Product } from '@/models/all';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { products } = body;

        // Validate stock and calculate total price on server side
        let calculatedTotal = 0;

        for (const item of products) {
            const product = await Product.findById(item.product);
            if (!product) {
                throw new Error(`Product not found: ${item.product}`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product: ${product.name}`);
            }
            const effectivePrice = (product.discountPrice && product.discountPrice < product.price)
                ? product.discountPrice
                : product.price;
            calculatedTotal += effectivePrice * item.quantity;
        }

        // Create order
        const order = await Order.create({
            ...body,
            totalPrice: calculatedTotal + 100, // Add flat 100rs delivery fee
            status: 'Pending',
            paymentMode: 'COD'
        });

        // Reduce stock
        for (const item of products) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }

        return NextResponse.json(order, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    const query: any = {};
    if (phone) {
        query['customer.phone'] = phone;
    } else {
        // Security: Don't allow listing all orders without admin access or specific phone
        // Or if this is for admin usage, it should check auth. 
        // For this simple task, we'll return empty if no phone is provided for the "Shop" side API.
        // Assuming this endpoint is shared? 
        // Wait, admin API is different (/api/admin/orders). This is /api/orders.
        // So public API should NOT return all orders.
        return NextResponse.json([]);
    }

    const orders = await Order.find(query).populate('products.product').sort({ createdAt: -1 });
    return NextResponse.json(orders);
}
