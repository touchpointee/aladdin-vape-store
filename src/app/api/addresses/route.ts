import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Address } from '@/models/all';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const phone = searchParams.get('phone');

        if (!phone) {
            return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
        }

        const addresses = await Address.find({ phone }).sort({ createdAt: -1 });
        return NextResponse.json(addresses);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        // Simple validation
        if (!body.phone || !body.address || !body.city || !body.pincode || !body.email || body.age === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newAddress = await Address.create(body);
        return NextResponse.json(newAddress, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { _id, ...updateData } = body;

        if (!_id) {
            return NextResponse.json({ error: 'Address ID required' }, { status: 400 });
        }

        const updated = await Address.findByIdAndUpdate(_id, updateData, { new: true });

        if (!updated) {
            return NextResponse.json({ error: 'Address not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Address ID required' }, { status: 400 });
        }

        const deleted = await Address.findByIdAndDelete(id);

        if (!deleted) {
            return NextResponse.json({ error: 'Address not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Address deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
