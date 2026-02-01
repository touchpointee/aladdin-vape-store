"use client";

import Link from "next/link";
import { ArrowLeft, MapPin, Truck, CreditCard, ShoppingBag, Package, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

export default function OrderDetailPage() {
    const { id } = useParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${id}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data);

                // Auto-refresh tracking if applicable
                if (data.awbNumber && data.shipmentStatus === 'Created' && data.status !== 'Cancelled' && data.status !== 'Delivered') {
                    refreshTracking(data._id);
                }
            }
        } catch (error) {
            console.error("Error fetching order", error);
        } finally {
            setLoading(false);
        }
    };

    const refreshTracking = async (orderId?: string) => {
        const oid = orderId || id;
        try {
            const res = await fetch(`/api/orders/${oid}/track`);
            if (res.ok) {
                const data = await res.json();
                if (data.currentStatus) {
                    setOrder((prev: any) => ({ ...prev, status: data.currentStatus }));
                }
            }
        } catch (err) {
            console.error('Auto-refresh tracking failed', err);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    if (loading) return <div className="p-10 text-center text-gray-500">Loading order details...</div>;

    if (!order) {
        return (
            <div className="p-10 text-center">
                <h1 className="text-xl font-bold">Order not found</h1>
                <Link href="/orders" className="text-blue-500 underline mt-4 block">Back to Orders</Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-safe">
            {/* Header */}
            <div className="bg-white p-4 flex items-center gap-4 border-b sticky top-0 z-10">
                <Link href="/orders">
                    <ArrowLeft size={24} className="text-gray-600" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-gray-900">Order Details</h1>
                    <p className="text-xs text-gray-500">ID: {order._id}</p>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Status Card */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === 'Cancelled' ? 'bg-red-50 text-red-600' : order.status === 'Delivered' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                            {order.status === 'Pending' && <ShoppingBag size={20} />}
                            {(order.status === 'Pickup Pending' || order.status === 'Pickup Scheduled') && <Package size={20} />}
                            {order.status === 'Picked Up' && <Package size={20} />}
                            {(order.status === 'In Transit' || order.status === 'Out For Delivery') && <Truck size={20} />}
                            {order.status === 'Delivered' && <CheckCircle size={20} />}
                            {order.status === 'Cancelled' && <XCircle size={20} />}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900">{order.status}</p>
                            <p className="text-xs text-gray-500">Order placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        {order.awbNumber && (
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 uppercase">AWB</p>
                                <p className="text-xs font-mono font-bold text-gray-700">{order.awbNumber}</p>
                            </div>
                        )}
                    </div>
                    {/* Timeline */}
                    <div className="pl-5 border-l-2 border-gray-100 space-y-4 relative">
                        <div className="relative">
                            <div className="absolute -left-[25px] top-1 w-3 h-3 bg-green-500 rounded-full ring-4 ring-white"></div>
                            <p className="text-xs font-bold text-gray-900">Order Placed</p>
                            <p className="text-[10px] text-gray-400">Your order has been received</p>
                        </div>
                        {['Pickup Pending', 'Pickup Scheduled', 'Picked Up', 'In Transit', 'Out For Delivery', 'Delivered'].includes(order.status) && (
                            <div className="relative">
                                <div className="absolute -left-[25px] top-1 w-3 h-3 bg-green-500 rounded-full ring-4 ring-white"></div>
                                <p className="text-xs font-bold text-gray-900">Pickup Pending</p>
                                <p className="text-[10px] text-gray-400">Waiting for courier pickup</p>
                            </div>
                        )}
                        {['Picked Up', 'In Transit', 'Out For Delivery', 'Delivered'].includes(order.status) && (
                            <div className="relative">
                                <div className="absolute -left-[25px] top-1 w-3 h-3 bg-green-500 rounded-full ring-4 ring-white"></div>
                                <p className="text-xs font-bold text-gray-900">Picked Up</p>
                                <p className="text-[10px] text-gray-400">Courier has picked up your order</p>
                            </div>
                        )}
                        {['In Transit', 'Out For Delivery', 'Delivered'].includes(order.status) && (
                            <div className="relative">
                                <div className="absolute -left-[25px] top-1 w-3 h-3 bg-green-500 rounded-full ring-4 ring-white"></div>
                                <p className="text-xs font-bold text-gray-900">In Transit</p>
                                <p className="text-[10px] text-gray-400">Your order is on the way</p>
                            </div>
                        )}
                        {['Out For Delivery', 'Delivered'].includes(order.status) && (
                            <div className="relative">
                                <div className="absolute -left-[25px] top-1 w-3 h-3 bg-green-500 rounded-full ring-4 ring-white"></div>
                                <p className="text-xs font-bold text-gray-900">Out For Delivery</p>
                                <p className="text-[10px] text-gray-400">Your order will be delivered today</p>
                            </div>
                        )}
                        {order.status === 'Delivered' && (
                            <div className="relative">
                                <div className="absolute -left-[25px] top-1 w-3 h-3 bg-green-500 rounded-full ring-4 ring-white"></div>
                                <p className="text-xs font-bold text-gray-900">Delivered</p>
                                <p className="text-[10px] text-gray-400">Order has been delivered successfully</p>
                            </div>
                        )}
                        {order.status === 'Cancelled' && (
                            <div className="relative">
                                <div className="absolute -left-[25px] top-1 w-3 h-3 bg-red-500 rounded-full ring-4 ring-white"></div>
                                <p className="text-xs font-bold text-gray-900 text-red-600">Cancelled</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Items */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <ShoppingBag size={16} /> Items ({order.products?.length || 0})
                    </h3>
                    <div className="space-y-4">
                        {order.products?.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-3">
                                <div className="w-16 h-16 relative border rounded bg-gray-50 shrink-0">
                                    <Image
                                        src={item.product?.images?.[0] || '/placeholder.png'}
                                        alt={item.product?.name || 'Product'}
                                        fill
                                        className="object-contain p-1"
                                        unoptimized
                                    />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-800 line-clamp-1">{item.product?.name}</h4>
                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                    <div className="flex flex-col items-start mt-1">
                                        <span className="text-sm font-bold text-gray-900">₹{item.price * item.quantity}</span>
                                        {item.originalPrice && item.originalPrice > item.price && (
                                            <span className="text-xs text-gray-400 line-through">
                                                ₹{item.originalPrice * item.quantity}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <MapPin size={16} /> Shipping Address
                    </h3>
                    <div className="text-sm text-gray-600 leading-relaxed">
                        <p className="font-bold text-gray-900">{order.customer?.name}</p>
                        <p>{order.customer?.address}</p>
                        <p>{order.customer?.city} - {order.customer?.pincode}</p>
                        <p className="mt-1 font-semibold">Phone: {order.customer?.phone}</p>
                    </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <CreditCard size={16} /> Payment Summary
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-500">
                            <span>Subtotal</span>
                            <span>₹{order.products?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                            <span>Shipping</span>
                            <span className="text-gray-900 font-medium">₹100</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold text-lg text-gray-900 mt-2">
                            <span>Total</span>
                            <span>₹{order.totalPrice}</span>
                        </div>
                    </div>
                    <div className="mt-3 bg-blue-50 text-blue-700 text-xs px-3 py-2 rounded font-semibold text-center uppercase">
                        Payment Mode: {order.paymentMode}
                    </div>
                </div>
            </div>
        </div>
    );
}
