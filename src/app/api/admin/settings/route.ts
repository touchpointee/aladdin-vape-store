import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Settings } from '@/models/all';

export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const key = searchParams.get('key');

        if (key) {
            const setting = await Settings.findOne({ key });
            return NextResponse.json({ value: setting?.value || '' });
        }

        const settings = await Settings.find({});
        const formattedSettings = settings.reduce((acc: any, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        return NextResponse.json(formattedSettings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { key, value } = body;

        if (!key || !value) {
            return NextResponse.json({ error: 'Key and Value are required' }, { status: 400 });
        }

        const setting = await Settings.findOneAndUpdate(
            { key },
            { value },
            { upsert: true, new: true }
        );

        return NextResponse.json(setting);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
    }
}
