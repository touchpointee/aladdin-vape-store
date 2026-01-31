import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { PushSubscription } from '@/models/all';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { subscription } = await req.json();

        if (!subscription) {
            return NextResponse.json({ error: 'Subscription is required' }, { status: 400 });
        }

        // We only allow one subscription per unique endpoint to avoid duplicates
        const endpoint = subscription.endpoint;

        await PushSubscription.findOneAndUpdate(
            { 'subscription.endpoint': endpoint },
            { subscription, isAdmin: true },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, message: 'Subscribed to background notifications' });
    } catch (error: any) {
        console.error('Subscription error:', error);
        return NextResponse.json({ error: error.message || 'Failed to subscribe' }, { status: 500 });
    }
}
