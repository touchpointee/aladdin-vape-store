import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';

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
            calculatedTotal += product.price * item.quantity; // Note: Use discount price if applicable logic added later
        }

        // Create order
        const order = await Order.create({
            ...body,
            totalPrice: calculatedTotal, // Ensure server-side calculation is respected or validated
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

export async function GET() {
    await connectDB();
    const orders = await Order.find({}).populate('products.product').sort({ createdAt: -1 });
    return NextResponse.json(orders);
}
