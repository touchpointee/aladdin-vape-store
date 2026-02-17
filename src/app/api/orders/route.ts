import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order, Product, UTR } from '@/models/unified';
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

            // Find variant price if nicotine is selected
            let effectivePrice = 0;

            if (item.nicotine && product.variants && product.variants.length > 0) {
                const variant = product.variants.find((v: any) => v.nicotine === item.nicotine);
                if (variant) {
                    effectivePrice = (variant.discountPrice && variant.discountPrice < variant.price)
                        ? variant.discountPrice
                        : variant.price;

                    if (variant.stock < item.quantity) {
                        throw new Error(`Insufficient stock for variant ${item.nicotine} of ${product.name}`);
                    }
                } else {
                    throw new Error(`Variant ${item.nicotine} not found for ${product.name}`);
                }
            } else {
                // Base pricing
                effectivePrice = (product.discountPrice && product.discountPrice < (product.price || 0))
                    ? product.discountPrice
                    : (product.price || 0);

                if ((product.stock || 0) < item.quantity) {
                    throw new Error(`Insufficient stock for product: ${product.name}`);
                }
            }

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

        // Validate customer phone: must be 10 digits
        const customerPhone = (body.customer?.phone ?? '').toString().replace(/\D/g, '');
        if (customerPhone.length !== 10) {
            return NextResponse.json({ error: 'Phone number must be exactly 10 digits' }, { status: 400 });
        }
        const customerWithPhone = {
            ...body.customer,
            phone: customerPhone
        };

        const orderSource = body.orderSource === 'app' ? 'app' : 'website';

        // Create order
        const order = await Order.create({
            ...body,
            customer: customerWithPhone,
            totalPrice: calculatedTotal + 100, // Add flat 100rs delivery fee
            status: 'Pending',
            paymentMode: orderPaymentMode,
            paymentStatus: orderPaymentStatus,
            utrNumber: paymentMode === 'PREPAID' ? utrNumber.trim() : undefined,
            orderSource
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
            if (item.nicotine) {
                await Product.updateOne(
                    { _id: item.product, "variants.nicotine": item.nicotine },
                    { $inc: { "variants.$.stock": -item.quantity } }
                );
            } else {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: -item.quantity }
                });
            }
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
