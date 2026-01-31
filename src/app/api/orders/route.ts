import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order, Product } from '@/models/all';
import UTR from '@/models/UTR';
import { sendPushNotificationToAdmins } from '@/lib/push';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { products, paymentMode, utrNumber } = body;

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

        // Handle prepaid payment with UTR validation
        let orderPaymentStatus = 'COD';
        let orderPaymentMode = 'COD';

        if (paymentMode === 'PREPAID') {
            if (!utrNumber || utrNumber.trim().length < 6) {
                return NextResponse.json({ error: 'Valid UTR number is required for prepaid payment' }, { status: 400 });
            }

            // Check if UTR already exists (duplicate prevention)
            const existingUTR = await UTR.findOne({ utr: utrNumber.trim() });
            if (existingUTR) {
                return NextResponse.json({ error: 'This UTR has already been used. Please enter a valid UTR.' }, { status: 400 });
            }

            orderPaymentStatus = 'pending_verification';
            orderPaymentMode = 'PREPAID';
        }

        // Create order
        const order = await Order.create({
            ...body,
            totalPrice: calculatedTotal + 100, // Add flat 100rs delivery fee
            status: 'Pending',
            paymentMode: orderPaymentMode,
            paymentStatus: orderPaymentStatus,
            utrNumber: paymentMode === 'PREPAID' ? utrNumber.trim() : undefined
        });

        // Save UTR to prevent reuse (only for prepaid)
        if (paymentMode === 'PREPAID') {
            await UTR.create({
                utr: utrNumber.trim(),
                orderId: order._id
            });
        }

        // Reduce stock
        for (const item of products) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }

        // Trigger background push notifications for admins
        sendPushNotificationToAdmins({
            title: '🎉 New Order Received!',
            body: `Order from ${body.customer.name} for ₹${calculatedTotal + 100}`,
            url: '/admin/orders' // This will open the admin orders page
        }).catch(err => console.error('Delayed push error:', err));

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
        return NextResponse.json([]);
    }

    const orders = await Order.find(query).populate('products.product').sort({ createdAt: -1 });
    return NextResponse.json(orders);
}

