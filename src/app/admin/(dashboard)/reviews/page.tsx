"use client";

import { useState, useEffect } from "react";
import { Star, Trash2, CheckCircle, XCircle, MessageSquare } from "lucide-react";

interface Review {
    _id: string;
    product: { _id: string; name: string; slug?: string };
    rating: number;
    comment: string;
    authorName: string;
    customerId?: string;
    status: string;
    createdAt: string;
}

interface Product {
    _id: string;
    name: string;
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [productFilter, setProductFilter] = useState<string>("");
    const [actioningId, setActioningId] = useState<string | null>(null);

    const fetchReviews = async () => {
        try {
            const url = productFilter ? `/api/admin/reviews?productId=${productFilter}` : "/api/admin/reviews";
            const res = await fetch(url);
            const data = await res.json();
            if (res.ok) setReviews(data.reviews || []);
        } catch (_) {}
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/admin/products");
            const data = await res.json();
            if (res.ok) setProducts(Array.isArray(data) ? data : data?.products || []);
        } catch (_) {}
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchReviews(), fetchProducts()]).finally(() => setLoading(false));
    }, [productFilter]);

    const updateStatus = async (id: string, status: string) => {
        setActioningId(id);
        try {
            const res = await fetch(`/api/admin/reviews/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (res.ok) await fetchReviews();
        } catch (_) {}
        setActioningId(null);
    };

    const deleteReview = async (id: string) => {
        if (!confirm("Delete this review?")) return;
        setActioningId(id);
        try {
            const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
            if (res.ok) setReviews((prev) => prev.filter((r) => r._id !== id));
        } catch (_) {}
        setActioningId(null);
    };

    if (loading && reviews.length === 0) {
        return <div className="p-8 text-center text-gray-500">Loading reviews...</div>;
    }

    return (
        <div className="max-w-5xl">
            <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="text-blue-600" size={28} />
                <h1 className="text-2xl font-bold text-gray-900">Manage Reviews</h1>
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-4">
                <label className="text-sm font-semibold text-gray-700">Filter by product</label>
                <select
                    value={productFilter}
                    onChange={(e) => setProductFilter(e.target.value)}
                    className="border border-gray-200 rounded-lg px-4 py-2 min-w-[200px]"
                >
                    <option value="">All products</option>
                    {products.map((p) => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {reviews.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No reviews found.</div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {reviews.map((r) => (
                            <li key={r._id} className="p-4 hover:bg-gray-50/50">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <div className="flex text-yellow-400">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star key={s} size={14} className={s <= r.rating ? "fill-current" : ""} />
                                                ))}
                                            </div>
                                            <span className="text-sm font-bold text-gray-800">{r.authorName || "Guest"}</span>
                                            <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</span>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${r.status === "approved" ? "bg-green-100 text-green-700" : r.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                                                {r.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1 font-medium">{(r.product as any)?.name || "Product"}</p>
                                        {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {r.status !== "approved" && (
                                            <button
                                                onClick={() => updateStatus(r._id, "approved")}
                                                disabled={actioningId === r._id}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                                                title="Approve"
                                            >
                                                <CheckCircle size={20} />
                                            </button>
                                        )}
                                        {r.status !== "rejected" && (
                                            <button
                                                onClick={() => updateStatus(r._id, "rejected")}
                                                disabled={actioningId === r._id}
                                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg disabled:opacity-50"
                                                title="Reject"
                                            >
                                                <XCircle size={20} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteReview(r._id)}
                                            disabled={actioningId === r._id}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                                            title="Delete"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
