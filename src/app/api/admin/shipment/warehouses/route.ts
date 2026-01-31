import { NextResponse } from 'next/server';
import { getWarehouses } from '@/lib/webparex';

export async function GET() {
    try {
        const data = await getWarehouses();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error fetching warehouses:", error);
        return NextResponse.json({ error: error.message || 'Failed to fetch warehouses' }, { status: 500 });
    }
}
