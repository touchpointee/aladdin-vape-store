"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Package, User, MapPin, Truck, CheckCircle, XCircle, Clock, Printer } from "lucide-react";
import Link from "next/link";
import { IOrder } from "@/models/all";

export default function AdminOrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/admin/orders/${id}`);
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();
            setOrder(data);
        } catch (error) {
            console.error("Error fetching order", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                const updatedOrder = await res.json();
                setOrder(updatedOrder);
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status", error);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading order details...</div>;
    if (!order) return <div className="p-8 text-center text-red-500">Order not found</div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Confirmed': return 'bg-blue-100 text-blue-700';
            case 'Delivered': return 'bg-green-100 text-green-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            {/* Main UI (Hidden during print) */}
            <div className="no-print">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/orders" className="back-button p-2 hover:bg-gray-200 rounded-full transition shrink-0">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl font-bold flex flex-wrap items-center gap-2">
                                <span className="truncate">Order #{order._id.toString().substring(0, 8)}</span>
                                <span className={`px-2 py-0.5 text-xs rounded-full whitespace-nowrap ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </h1>
                            <p className="text-gray-500 text-xs sm:text-sm">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="no-print flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition font-bold text-sm sm:text-base shrink-0 shadow-md"
                    >
                        <Printer size={18} />
                        Print Invoice
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Order Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Package size={20} /> Order Items
                            </h2>
                            <div className="space-y-4">
                                {order.products.map((item: any, idx: number) => (
                                    <div key={idx} className="flex gap-4 border-b last:border-0 pb-4 last:pb-0">
                                        <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.product?.images?.[0] && (
                                                <Image
                                                    src={item.product.images[0]}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-contain p-2"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{item.product?.name || "Unknown Product"}</h3>
                                            <div className="text-sm text-gray-500">
                                                {item.product?.puffCount && `${item.product.puffCount} Puffs`} · {item.product?.brand?.name}
                                            </div>
                                            <div className="mt-2 flex justify-between items-center text-sm">
                                                <span className="text-gray-600">Qty: {item.quantity}</span>
                                                <span className="font-bold">₹{item.price * item.quantity}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-4 border-t flex justify-between items-center">
                                <span className="font-semibold text-gray-600">Total Amount</span>
                                <span className="text-2xl font-bold text-blue-600">₹{order.totalPrice}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Customer & Actions */}
                    <div className="space-y-6">
                        {/* Status Actions */}
                        <div className="no-print bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="font-bold text-gray-800 mb-4">Update Status</h2>
                            <div className="space-y-2">
                                <button
                                    onClick={() => handleStatusUpdate('Pending')}
                                    disabled={updating || order.status === 'Pending'}
                                    className="w-full flex items-center justify-between p-3 rounded border hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <span className="flex items-center gap-2"><Clock size={16} className="text-yellow-500" /> Pending</span>
                                    {order.status === 'Pending' && <CheckCircle size={16} className="text-green-500" />}
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate('Confirmed')}
                                    disabled={updating || order.status === 'Confirmed'}
                                    className="w-full flex items-center justify-between p-3 rounded border hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <span className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-500" /> Confirmed</span>
                                    {order.status === 'Confirmed' && <CheckCircle size={16} className="text-green-500" />}
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate('Delivered')}
                                    disabled={updating || order.status === 'Delivered'}
                                    className="w-full flex items-center justify-between p-3 rounded border hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <span className="flex items-center gap-2"><Truck size={16} className="text-green-500" /> Delivered</span>
                                    {order.status === 'Delivered' && <CheckCircle size={16} className="text-green-500" />}
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate('Cancelled')}
                                    disabled={updating || order.status === 'Cancelled'}
                                    className="w-full flex items-center justify-between p-3 rounded border hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <span className="flex items-center gap-2"><XCircle size={16} className="text-red-500" /> Cancelled</span>
                                    {order.status === 'Cancelled' && <CheckCircle size={16} className="text-green-500" />}
                                </button>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <User size={20} /> Customer Details
                            </h2>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <label className="text-gray-500 text-xs uppercase">Name & Age</label>
                                    <div className="font-medium">{order.customer.name} ({order.customer.age} Yrs)</div>
                                </div>
                                <div>
                                    <label className="text-gray-500 text-xs uppercase">Phone</label>
                                    <div className="font-medium">{order.customer.phone}</div>
                                </div>
                                <div>
                                    <label className="text-gray-500 text-xs uppercase">Email</label>
                                    <div className="font-medium">{order.customer.email}</div>
                                </div>
                                <div>
                                    <label className="text-gray-500 text-xs uppercase">Payment Mode</label>
                                    <div className="font-medium">{order.paymentMode}</div>
                                </div>

                                <div className="pt-2 border-t mt-2">
                                    <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                        <MapPin size={16} /> Shipping Address
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {order.customer.address}<br />
                                        {order.customer.landmark && <>{order.customer.landmark}<br /></>}
                                        {order.customer.city}<br />
                                        {order.customer.pincode}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Print Only Invoice Template */}
                <div className="print-only-invoice hidden print:block bg-white text-black p-8 font-sans">
                    <div className="flex justify-between items-start border-b pb-8 mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold uppercase tracking-tighter">Aladdin Store</h1>
                            <p className="text-sm text-gray-500 mt-1">Premium Vape & Accessories</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold text-gray-800 uppercase">Invoice</h2>
                            <p className="text-sm font-mono mt-1">#{order._id.toString().toUpperCase()}</p>
                            <p className="text-sm text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 mb-10">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Bill To</h3>
                            <div className="space-y-1">
                                <p className="text-lg font-bold">{order.customer.name}</p>
                                <p className="text-sm text-gray-600">{order.customer.email}</p>
                                <p className="text-sm text-gray-600">Phone: {order.customer.phone}</p>
                                <p className="text-sm text-gray-600">Age: {order.customer.age} Yrs</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Shipping Address</h3>
                            <div className="space-y-1 text-sm text-gray-600 leading-relaxed">
                                <p>{order.customer.address}</p>
                                {order.customer.landmark && <p>Landmark: {order.customer.landmark}</p>}
                                <p>{order.customer.city} - {order.customer.pincode}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-10">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b-2 border-black text-left">
                                    <th className="py-4 text-xs font-bold uppercase tracking-widest">Description</th>
                                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-center">Price</th>
                                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-center">Qty</th>
                                    <th className="py-4 text-xs font-bold uppercase tracking-widest text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.products.map((item: any, idx: number) => (
                                    <tr key={idx} className="border-b border-gray-100">
                                        <td className="py-5">
                                            <p className="font-bold text-gray-900">{item.product?.name || "Unknown Product"}</p>
                                            <p className="text-xs text-gray-500 mt-1">{item.product?.puffCount && `${item.product.puffCount} Puffs`} · {item.product?.brand?.name}</p>
                                        </td>
                                        <td className="py-5 px-4 text-center text-sm">₹{item.price}</td>
                                        <td className="py-5 px-4 text-center text-sm">{item.quantity}</td>
                                        <td className="py-5 text-right font-bold">₹{item.price * item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-200">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{order.totalPrice}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t-2 border-black">
                                <span className="text-lg font-bold uppercase tracking-tighter">Grand Total</span>
                                <span className="text-2xl font-black text-blue-600">₹{order.totalPrice}</span>
                            </div>
                            <div className="pt-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right mb-1">Payment Method</p>
                                <p className="text-xs font-bold text-right uppercase bg-gray-50 p-2 rounded">{order.paymentMode}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-20 pt-10 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-400">Thank you for shopping with Aladdin Store!</p>
                        <p className="text-[10px] text-gray-300 mt-2 uppercase tracking-widest">Generated on {new Date().toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
