"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Package, User, MapPin, Truck, CheckCircle, XCircle, Clock, Printer, CreditCard, Trash2 } from "lucide-react";
import Link from "next/link";
import { IOrder } from "@/models/all";
import PrintOrderReceipt from "@/components/admin/PrintOrderReceipt";

export default function AdminOrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [loadingWarehouses, setLoadingWarehouses] = useState(false);
    const [shipmentData, setShipmentData] = useState({
        state: "",
        warehouse_id: "",
        weight: 200,
        length: 10,
        width: 10,
        height: 10
    });

    useEffect(() => {
        fetchOrder();
    }, [id]);

    useEffect(() => {
        if (isShipmentModalOpen && warehouses.length === 0) {
            fetchWarehouses();
        }
    }, [isShipmentModalOpen]);

    const fetchWarehouses = async () => {
        setLoadingWarehouses(true);
        try {
            const res = await fetch('/api/admin/shipment/warehouses');
            const data = await res.json();
            if (res.ok && data.result === "1") {
                setWarehouses(data.data || []);
                if (data.data && data.data.length > 0) {
                    setShipmentData(prev => ({ ...prev, warehouse_id: data.data[0].id.toString() }));
                }
            }
        } catch (error) {
            console.error("Error fetching warehouses", error);
        } finally {
            setLoadingWarehouses(false);
        }
    };

    useEffect(() => {
        if (order) {
            setShipmentData(prev => ({
                ...prev,
                state: order.customer.state || order.customer.city || ""
            }));
        }
    }, [order]);

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

    const handleCreateShipment = async (e: React.FormEvent) => {
        e.preventDefault();

        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}/shipment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(shipmentData)
            });

            const result = await res.json();
            if (res.ok) {
                alert("Shipment created successfully!");
                setIsShipmentModalOpen(false);
                fetchOrder();
            } else {
                alert(result.error || "Failed to create shipment");
            }
        } catch (error) {
            console.error("Error creating shipment", error);
            alert("An error occurred while creating shipment");
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

    /* 
    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;

        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                router.push("/admin/orders");
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete order");
            }
        } catch (error) {
            alert("Something went wrong");
        } finally {
            setUpdating(false);
        }
    };
    */

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
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={handlePrint}
                                className="no-print flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition font-bold text-sm sm:text-base shadow-md"
                            >
                                <Printer size={18} />
                                Print
                            </button>
                            {/* <button
                                onClick={handleDelete}
                                disabled={updating}
                                className="no-print flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-lg hover:bg-red-100 transition font-bold text-sm sm:text-base border border-red-200 disabled:opacity-50"
                            >
                                <Trash2 size={18} />
                                Delete
                            </button> */}
                        </div>
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

                            {/* Shipment Actions */}
                            <div className="no-print bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
                                    <span>Webparex Shipment</span>
                                    {order.shipmentStatus === 'Created' && (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Created</span>
                                    )}
                                </h2>
                                <div className="space-y-3">
                                    {order.shipmentStatus === 'Created' ? (
                                        <div className="space-y-2">
                                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                                <div className="text-xs text-green-800 font-bold mb-1">Shipment Already Created</div>
                                                <div className="text-[10px] text-green-600 font-mono break-all line-clamp-1">ID: {order.shipmentOrderId}</div>
                                            </div>
                                            <button
                                                disabled
                                                className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-100 text-gray-400 font-bold text-sm cursor-not-allowed"
                                            >
                                                <Package size={16} /> Created on Webparex
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => setIsShipmentModalOpen(true)}
                                                disabled={updating || order.status === 'Cancelled'}
                                                className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-sm disabled:opacity-50"
                                            >
                                                <Truck size={18} /> Create Shipment
                                            </button>
                                            {order.shipmentStatus === 'Failed' && (
                                                <div className="text-[10px] text-red-500 bg-red-50 p-2 rounded border border-red-100">
                                                    <strong>Last Attempt Failed:</strong> {order.shipmentResponse?.error || 'Unknown error'}
                                                </div>
                                            )}
                                            <p className="text-[10px] text-gray-400 text-center">
                                                Pushes order details to Webparex pickup system
                                            </p>
                                        </div>
                                    )}
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
                                            {order.customer.city}, {order.customer.state}<br />
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

            {/* Shipment Modal */}
            {isShipmentModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl border w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-indigo-600 p-6 text-white">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Truck /> Create Shipment
                            </h3>
                            <p className="text-sm text-indigo-100 mt-1">Fill in the dimensions and logistics details</p>
                        </div>

                        <form onSubmit={handleCreateShipment} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Customer State</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={shipmentData.state}
                                        onChange={(e) => setShipmentData({ ...shipmentData, state: e.target.value })}
                                        placeholder="e.g. Kerala"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1 italic">Mandatory field for Shipmozo: Pre-filled from order details.</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pickup Warehouse</label>
                                    <select
                                        required
                                        className="w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none bg-white disabled:bg-gray-50 text-sm truncate"
                                        value={shipmentData.warehouse_id}
                                        onChange={(e) => setShipmentData({ ...shipmentData, warehouse_id: e.target.value })}
                                        disabled={loadingWarehouses}
                                    >
                                        <option value="" disabled>Select a Warehouse</option>
                                        {warehouses.map((w) => (
                                            <option key={w.id} value={w.id}>
                                                {w.name} ({w.city})
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-gray-400 mt-1 italic">Selecting a warehouse will use its registered pickup address.</p>
                                    {loadingWarehouses && <p className="text-[10px] text-indigo-500 mt-1 animate-pulse">Fetching warehouses...</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Weight (gm)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={shipmentData.weight}
                                        onChange={(e) => setShipmentData({ ...shipmentData, weight: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Length (cm)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={shipmentData.length}
                                        onChange={(e) => setShipmentData({ ...shipmentData, length: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Width (cm)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={shipmentData.width}
                                        onChange={(e) => setShipmentData({ ...shipmentData, width: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Height (cm)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={shipmentData.height}
                                        onChange={(e) => setShipmentData({ ...shipmentData, height: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsShipmentModalOpen(false)}
                                    className="flex-1 p-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="flex-1 p-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                                >
                                    {updating ? "Processing..." : "Submit Shipment"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

