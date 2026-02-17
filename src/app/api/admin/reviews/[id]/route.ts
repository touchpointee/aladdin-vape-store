import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Review } from '@/models/unified';

/** PATCH: Update review status (approve/reject) */
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    await connectDB();
    const params = await props.params;
    let body: { status?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const { status } = body;
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
        return NextResponse.json({ error: 'status must be pending, approved, or rejected' }, { status: 400 });
    }

    const review = await Review.findByIdAndUpdate(
        params.id,
        { status },
        { new: true }
    );
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    return NextResponse.json(review);
}

/** DELETE: Remove a review */
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    await connectDB();
    const params = await props.params;
    const review = await Review.findByIdAndDelete(params.id);
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    return NextResponse.json({ message: 'Deleted' });
}
