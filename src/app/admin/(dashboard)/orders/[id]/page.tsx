"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Package, User, MapPin, Truck, CheckCircle, XCircle, Clock, Printer, CreditCard } from "lucide-react";
import Link from "next/link";
import { IOrder } from "@/models/all";
import PrintOrderReceipt from "@/components/admin/PrintOrderReceipt";

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

    const handlePaymentUpdate = async (newPaymentStatus: string) => {
        if (!confirm(`Are you sure you want to change payment status to ${newPaymentStatus}?`)) return;

        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentStatus: newPaymentStatus })
            });

            if (res.ok) {
                const updatedOrder = await res.json();
                setOrder(updatedOrder);
            } else {
                alert("Failed to update payment status");
            }
        } catch (error) {
            console.error("Error updating payment status", error);
        } finally {
            setUpdating(false);
        }
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
            case 'Packed': return 'bg-blue-100 text-blue-700';
            case 'In Transit': return 'bg-purple-100 text-purple-700';
            case 'Delivered': return 'bg-green-100 text-green-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    return (
        <>
            <div className="max-w-5xl mx-auto print:hidden">
                <div>
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
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-bold">₹{item.price * item.quantity}</span>
                                                        {item.originalPrice && item.originalPrice > item.price && (
                                                            <span className="text-xs text-gray-400 line-through">
                                                                ₹{item.originalPrice * item.quantity}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-4 border-t space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-semibold text-gray-800">₹{order.products.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Delivery Charge</span>
                                        <span className="font-semibold text-gray-800">₹100.00</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t mt-2">
                                        <span className="font-bold text-gray-800">Total Amount</span>
                                        <span className="text-2xl font-bold text-blue-600">
                                            ₹{order.totalPrice}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Right Column: Customer & Actions */}
                        <div className="space-y-6">
                            {/* Payment Status Actions */}
                            <div className="no-print bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="font-bold text-gray-800 mb-4">Payment Status</h2>
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePaymentUpdate('Paid')}
                                            disabled={updating || order.paymentStatus === 'Paid'}
                                            className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg border-2 transition font-bold text-sm ${order.paymentStatus === 'Paid'
                                                ? 'bg-green-50 border-green-500 text-green-700'
                                                : 'border-gray-200 hover:border-green-300 text-gray-600'
                                                }`}
                                        >
                                            <CheckCircle size={16} /> Paid
                                        </button>
                                        <button
                                            onClick={() => handlePaymentUpdate('COD')}
                                            disabled={updating || order.paymentStatus === 'COD'}
                                            className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg border-2 transition font-bold text-sm ${order.paymentStatus === 'COD'
                                                ? 'bg-yellow-50 border-yellow-500 text-yellow-700'
                                                : 'border-gray-200 hover:border-yellow-300 text-gray-600'
                                                }`}
                                        >
                                            <Clock size={16} /> COD
                                        </button>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500 flex items-center gap-2">
                                        <CreditCard size={14} className="shrink-0" />
                                        <span>Current: <strong>{order.paymentStatus || 'COD'}</strong> via {order.paymentMode}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status Actions */}
                            <div className="no-print bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="font-bold text-gray-800 mb-4">Update Fulfillment Status</h2>
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
                                        onClick={() => handleStatusUpdate('Packed')}
                                        disabled={updating || order.status === 'Packed'}
                                        className="w-full flex items-center justify-between p-3 rounded border hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <span className="flex items-center gap-2"><Package size={16} className="text-blue-500" /> Packed</span>
                                        {order.status === 'Packed' && <CheckCircle size={16} className="text-green-500" />}
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('In Transit')}
                                        disabled={updating || order.status === 'In Transit'}
                                        className="w-full flex items-center justify-between p-3 rounded border hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <span className="flex items-center gap-2"><Truck size={16} className="text-purple-500" /> In Transit</span>
                                        {order.status === 'In Transit' && <CheckCircle size={16} className="text-green-500" />}
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('Delivered')}
                                        disabled={updating || order.status === 'Delivered'}
                                        className="w-full flex items-center justify-between p-3 rounded border hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <span className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Delivered</span>
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
                                        <div className="flex items-center justify-between">
                                            <div className="font-medium">{order.customer.phone}</div>
                                            <a
                                                href={`https://wa.me/${order.customer.phone?.replace(/\s+/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-green-600 hover:text-green-700 font-bold text-xs flex items-center gap-1 border border-green-200 bg-green-50 px-2 py-1 rounded"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
                                                WhatsApp
                                            </a>
                                        </div>
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
                </div >
            </div >

            <PrintOrderReceipt order={order} />
        </>
    );
}

