import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/all';

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
        const { status, paymentStatus } = body;

        const updateData: any = {};
        if (status) {
            const validStatuses = ['Pending', 'Packed', 'In Transit', 'Delivered', 'Cancelled'];
            if (!validStatuses.includes(status)) {
                return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
            }
            updateData.status = status;
        }

        if (paymentStatus) {
            const validPaymentStatuses = ['COD', 'Paid'];
            if (!validPaymentStatuses.includes(paymentStatus)) {
                return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 });
            }
            updateData.paymentStatus = paymentStatus;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'At least one field (status or paymentStatus) is required' }, { status: 400 });
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
