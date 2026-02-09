import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/unified';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const order = await Order.findById(id).populate('products.product');

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await req.json();
        const { status, paymentStatus, discount } = body;

        const updateData: any = {};
        if (status) {
            const validStatuses = ['Pending', 'Packed', 'Pickup Pending', 'Pickup Scheduled', 'Picked Up', 'In Transit', 'Out For Delivery', 'Delivered', 'Cancelled'];
            if (!validStatuses.includes(status)) {
                return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
            }
            updateData.status = status;
        }

        if (body.awbNumber !== undefined) {
            updateData.awbNumber = body.awbNumber;
        }


        if (paymentStatus) {
            const validPaymentStatuses = ['COD', 'Paid', 'pending_verification', 'verified', 'failed'];
            if (!validPaymentStatuses.includes(paymentStatus)) {
                return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 });
            }
            updateData.paymentStatus = paymentStatus;
        }

        if (body.customer) {
            updateData.customer = body.customer;
        }

        if (discount !== undefined) {
            const discountNum = Number(discount);
            if (isNaN(discountNum) || discountNum < 0) {
                return NextResponse.json({ error: 'Discount must be a non-negative number' }, { status: 400 });
            }
            updateData.discount = discountNum;

            // Fetch the order to recalculate totalPrice
            const currentOrder = await Order.findById(id).populate('products.product');
            if (currentOrder) {
                // Calculate subtotal from products
                const subtotal = currentOrder.products.reduce((sum: number, item: any) => {
                    return sum + (item.price * item.quantity);
                }, 0);

                // Recalculate total: subtotal - discount + delivery charge (100)
                const newTotal = subtotal - discountNum + 100;
                updateData.totalPrice = newTotal;
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'At least one field (status, paymentStatus, customer, or discount) is required' }, { status: 400 });
        }

        const order = await Order.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('products.product');

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const order = await Order.findByIdAndDelete(id);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Order deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }
}
