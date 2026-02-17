import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db';
import { Settings } from '@/models/unified';

export interface ReviewScreenshotItem {
  url: string;
  caption?: string;
  order?: number;
}

/** Admin: get list */
export async function GET() {
  try {
    await connectDB();
    const doc = await Settings.findOne({ key: 'review_screenshots' }).lean();
    const raw = doc?.value;
    let screenshots: ReviewScreenshotItem[] = [];
    if (raw) {
      try {
        screenshots = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch {
        screenshots = [];
      }
    }
    if (!Array.isArray(screenshots)) screenshots = [];
    screenshots.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return NextResponse.json({ screenshots });
  } catch (e) {
    console.error('Admin review screenshots GET:', e);
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
  }
}

/** Admin: replace full list (add/delete/reorder) */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const screenshots = Array.isArray(body.screenshots) ? body.screenshots : [];
    const normalized = screenshots.map((s: any, i: number) => ({
      url: typeof s?.url === 'string' ? s.url : '',
      caption: typeof s?.caption === 'string' ? s.caption : '',
      order: typeof s?.order === 'number' ? s.order : i,
    })).filter((s: any) => s.url);
    await Settings.findOneAndUpdate(
      { key: 'review_screenshots' },
      { value: JSON.stringify(normalized) },
      { upsert: true }
    );
    revalidatePath('/');
    return NextResponse.json({ screenshots: normalized });
  } catch (e) {
    console.error('Admin review screenshots POST:', e);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
