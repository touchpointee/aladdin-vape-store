import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Settings } from '@/models/unified';

export interface ReviewScreenshotItem {
  url: string;
  caption?: string;
  order?: number;
}

/** Public: list of customer review screenshots for home section */
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
    console.error('Review screenshots GET:', e);
    return NextResponse.json({ screenshots: [] });
  }
}
