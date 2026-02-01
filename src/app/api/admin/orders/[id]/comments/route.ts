import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/models/unified';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { $push: { comments: { text } } },
            { new: true }
        );

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(order.comments);
    } catch (error) {
        console.error('Failed to add comment:', error);
        return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const commentId = searchParams.get('commentId');

        if (!commentId) {
            return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { $pull: { comments: { _id: commentId } } },
            { new: true }
        );

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(order.comments);
    } catch (error) {
        console.error('Failed to delete comment:', error);
        return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
    }
}
