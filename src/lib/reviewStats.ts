import mongoose from 'mongoose';
import { Review } from '@/models/unified';

export type ReviewStatsMap = Record<string, { averageRating: number; reviewCount: number }>;

/**
 * Get averageRating and reviewCount (approved only) for the given product IDs.
 * Call after connectDB(). Returns a map keyed by product id string.
 */
export async function getReviewStatsForProductIds(
  productIds: (mongoose.Types.ObjectId | string)[]
): Promise<ReviewStatsMap> {
  if (!productIds.length) return {};

  const ids = productIds
    .map((id) => (id && typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id))
    .filter(Boolean) as mongoose.Types.ObjectId[];

  const reviewStats = await Review.aggregate([
    { $match: { product: { $in: ids }, status: 'approved' } },
    { $group: { _id: '$product', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
  ]);

  const map: ReviewStatsMap = {};
  reviewStats.forEach((s: { _id: mongoose.Types.ObjectId; averageRating: number; reviewCount: number }) => {
    const key = s._id != null ? String(s._id) : '';
    if (key) {
      map[key] = {
        averageRating: Math.round((Number(s.averageRating) || 0) * 10) / 10,
        reviewCount: Number(s.reviewCount) || 0,
      };
    }
  });
  return map;
}

/**
 * Attach averageRating and reviewCount to each product. Mutates items in place and returns the same array.
 */
export function attachReviewStatsToProducts<T extends { _id?: unknown }>(
  products: T[],
  statsMap: ReviewStatsMap
): T[] {
  products.forEach((p) => {
    const id = p._id != null ? String(p._id) : '';
    const stats = id ? statsMap[id] : undefined;
    (p as T & { averageRating: number | null; reviewCount: number }).averageRating = stats?.averageRating ?? null;
    (p as T & { averageRating: number | null; reviewCount: number }).reviewCount = stats?.reviewCount ?? 0;
  });
  return products;
}
