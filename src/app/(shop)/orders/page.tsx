"use client";

import Link from "next/link";
import { ArrowLeft, Package, ChevronRight, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";

export default function OrdersPage() {
    const { user, isLoggedIn } = useAuthStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (isLoggedIn && user?.phone) {
                try {
                    const res = await fetch(`/api/orders?phone=${user.phone}`);
                    if (res.ok) {
                        const data = await res.json();
                        setOrders(data);
                    }
                } catch (error) {
                    console.error("Failed to fetch orders");
                }
            }
            setLoading(false);
        };

        fetchOrders();
    }, [isLoggedIn, user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-safe">
            {/* Header */}
            <div className="bg-white p-4 flex items-center gap-4 border-b sticky top-0 z-10">
                <Link href="/account">
                    <ArrowLeft size={24} className="text-gray-600" />
                </Link>
                <h1 className="text-lg font-bold text-gray-900">My Orders</h1>
            </div>

            <div className="p-4 space-y-4">
                {!isLoggedIn ? (
                    <div className="text-center py-20 text-gray-500">
                        <p>Please login to view your orders.</p>
                        <Link href="/login" className="text-blue-600 font-bold mt-2 inline-block">Login Now</Link>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <Package size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No orders found.</p>
                        <Link href="/" className="text-blue-600 font-bold mt-2 inline-block">Start Shopping</Link>
                    </div>
                ) : (
                    orders.map((order: any) => (
                        <Link
                            href={`/orders/${order._id}`}
                            key={order._id}
                            className="block bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase">Order #{order._id.slice(-6)}</span>
                                    <h3 className="text-sm font-bold text-gray-900 mt-1">
                                        {order.products?.length || 0} Item{order.products?.length !== 1 ? 's' : ''}
                                    </h3>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' :
                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                                        'bg-blue-100 text-blue-600'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="flex justify-between items-end border-t pt-3 mt-3">
                                <div>
                                    <p className="text-xs text-gray-500">Total Amount</p>
                                    <p className="text-lg font-bold text-gray-900">₹{order.totalPrice}</p>
                                </div>
                                <div className="flex items-center text-blue-500 text-xs font-bold">
                                    View Details <ChevronRight size={14} />
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
