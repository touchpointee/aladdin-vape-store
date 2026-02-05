"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Package, User, MapPin, Truck, CheckCircle, XCircle, Clock, Printer, CreditCard, RefreshCw } from "lucide-react";
import Link from "next/link";
import { IOrder } from "@/models/unified";
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
    const [verifyUtr, setVerifyUtr] = useState('');

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

            // Auto-refresh tracking if applicable
            if (data.awbNumber && data.shipmentStatus === 'Created' && data.status !== 'Cancelled' && data.status !== 'Delivered') {
                refreshTracking(data._id);
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
            const res = await fetch(`/api/admin/orders/${oid}/track`);
            if (res.ok) {
                // If it's an auto-refresh, we just update the order state silently
                // fetchOrder will be called again or we can just update local state
                const data = await res.json();
                if (data.currentStatus) {
                    // Update order locally to avoid extra fetch if possible
                    setOrder((prev: any) => ({ ...prev, status: data.currentStatus }));
                }
            }
        } catch (err) {
            console.error('Auto-refresh tracking failed', err);
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
                                                        unoptimized
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">{item.product?.name || "Unknown Product"}</h3>
                                                <div className="text-sm text-gray-500 flex flex-col gap-0.5 mt-1">
                                                    {item.product?.puffCount && <span className="text-[10px] text-gray-400 font-bold uppercase">{item.product.puffCount} Puffs</span>}
                                                    {item.product?.brand?.name && <span className="text-[10px] text-gray-400 font-bold uppercase">{item.product.brand.name}</span>}
                                                    {item.flavour && (
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase">
                                                            Flavour: {item.flavour}
                                                        </span>
                                                    )}
                                                    {item.nicotine && (
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase">
                                                            Nicotine: {item.nicotine}
                                                        </span>
                                                    )}
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

                                {/* UTR Display for Prepaid Orders */}
                                {order.paymentMode === 'PREPAID' && order.utrNumber && (
                                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-amber-700 uppercase">UTR Number</span>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(order.utrNumber);
                                                    alert('UTR copied to clipboard!');
                                                }}
                                                className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-2 py-1 rounded font-bold flex items-center gap-1"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                                Copy
                                            </button>
                                        </div>
                                        <p className="font-mono text-lg font-bold text-amber-900 break-all">{order.utrNumber}</p>
                                        <p className="text-[10px] text-amber-600 mt-1">Verify this UTR in your payment app before approving.</p>
                                    </div>
                                )}

                                {/* Pending Verification Alert */}
                                {order.paymentStatus === 'pending_verification' && (
                                    <div className="mb-4 p-3 bg-orange-50 border border-orange-300 rounded-lg">
                                        <p className="text-sm font-bold text-orange-700 flex items-center gap-2">
                                            <Clock size={16} /> Pending Payment Verification
                                        </p>
                                        <p className="text-xs text-orange-600 mt-1">Customer has submitted UTR. Please verify the payment in your bank/UPI app.</p>
                                    </div>
                                )}

                                {/* UTR Verification Box */}
                                {order.paymentMode === 'PREPAID' && order.paymentStatus === 'pending_verification' && order.utrNumber && (
                                    <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                                            🔍 Paste UTR from your payment app to verify
                                        </label>
                                        <input
                                            type="text"
                                            value={verifyUtr}
                                            onChange={(e) => setVerifyUtr(e.target.value.replace(/\D/g, '').slice(0, 12))}
                                            className="w-full border-2 border-gray-300 rounded-lg p-3 text-lg font-mono tracking-wider focus:border-blue-500 outline-none text-center"
                                            placeholder="Paste 12-digit UTR here"
                                            maxLength={12}
                                        />
                                        {verifyUtr.length === 12 && (
                                            <div className={`mt-3 p-3 rounded-lg text-center font-bold ${verifyUtr === order.utrNumber
                                                ? 'bg-green-100 text-green-700 border border-green-300'
                                                : 'bg-red-100 text-red-700 border border-red-300'
                                                }`}>
                                                {verifyUtr === order.utrNumber ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <CheckCircle size={18} /> UTR Matched! Payment is valid.
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <XCircle size={18} /> UTR does NOT match! Be careful.
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        <p className="text-[10px] text-gray-500 mt-2 text-center">
                                            Copy the UTR from GPay/PhonePe/Paytm transaction details and paste here
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {/* Verification Buttons for Prepaid */}
                                    {order.paymentMode === 'PREPAID' && order.paymentStatus === 'pending_verification' && (
                                        <div className="flex gap-2 mb-3">
                                            <button
                                                onClick={() => handlePaymentUpdate('Paid')}
                                                disabled={updating}
                                                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition disabled:opacity-50"
                                            >
                                                <CheckCircle size={16} /> Verify Payment
                                            </button>
                                            <button
                                                onClick={() => handlePaymentUpdate('failed')}
                                                disabled={updating}
                                                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm border border-red-200 transition disabled:opacity-50"
                                            >
                                                <XCircle size={16} /> Reject
                                            </button>
                                        </div>
                                    )}

                                    {/* Status Display for Paid (Verified Prepaid) */}
                                    {order.paymentMode === 'PREPAID' && order.paymentStatus === 'Paid' && (
                                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
                                            <p className="text-sm font-bold text-green-700 flex items-center gap-2">
                                                <CheckCircle size={16} /> Payment Verified & Paid
                                            </p>
                                        </div>
                                    )}
                                    {order.paymentStatus === 'failed' && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
                                            <p className="text-sm font-bold text-red-700 flex items-center gap-2">
                                                <XCircle size={16} /> Payment Rejected
                                            </p>
                                        </div>
                                    )}

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


                            {/* Fulfillment Status - Tracking Based */}
                            <div className="no-print bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="font-bold text-gray-800 mb-4">Fulfillment Status</h2>

                                {/* Current Status Display */}
                                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-gray-500 uppercase">Current Status</span>
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                order.status === 'In Transit' || order.status === 'Out For Delivery' ? 'bg-purple-100 text-purple-700' :
                                                    order.status === 'Picked Up' ? 'bg-blue-100 text-blue-700' :
                                                        order.status === 'Pickup Pending' || order.status === 'Pickup Scheduled' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    {order.awbNumber && (
                                        <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-gray-200">
                                            <span className="text-gray-600">AWB Number:</span>
                                            <span className="font-mono font-bold text-gray-800">{order.awbNumber}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {/* Refresh Tracking Button - Show if shipment created */}
                                    {order.shipmentStatus === 'Created' && order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                                        <>
                                            {order.awbNumber ? (
                                                <button
                                                    onClick={async () => {
                                                        setUpdating(true);
                                                        await refreshTracking();
                                                        setUpdating(false);
                                                        alert("Tracking status updated!");
                                                    }}
                                                    disabled={updating}
                                                    className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition disabled:opacity-50"
                                                >
                                                    <RefreshCw size={16} className={updating ? 'animate-spin' : ''} />
                                                    Refresh Tracking Status
                                                </button>
                                            ) : (
                                                // No AWB yet - show sync button to set to Pickup Pending
                                                <button
                                                    onClick={() => handleStatusUpdate('Pickup Pending')}
                                                    disabled={updating || order.status === 'Pickup Pending'}
                                                    className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-bold transition disabled:opacity-50"
                                                >
                                                    <Package size={16} />
                                                    {order.status === 'Pickup Pending' ? 'Status: Pickup Pending' : 'Sync to Pickup Pending'}
                                                </button>
                                            )}
                                        </>
                                    )}


                                    {/* Manual Status Actions */}
                                    {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <button
                                                onClick={() => handleStatusUpdate('Packed')}
                                                disabled={updating || order.status === 'Packed'}
                                                className={`flex items-center justify-center gap-2 p-3 rounded-lg border font-bold transition disabled:opacity-50 text-sm ${order.status === 'Packed'
                                                        ? 'bg-blue-100 text-blue-700 border-blue-200 cursor-default'
                                                        : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
                                                    }`}
                                            >
                                                <Package size={16} /> Mark Packed
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate('Delivered')}
                                                disabled={updating}
                                                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white text-green-600 hover:bg-green-50 font-bold border border-green-200 transition disabled:opacity-50 text-sm"
                                            >
                                                <CheckCircle size={16} /> Mark Delivered
                                            </button>
                                        </div>
                                    )}

                                    {/* Cancel Order Button - Always available unless already cancelled/delivered */}
                                    {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                                        <button
                                            onClick={() => handleStatusUpdate('Cancelled')}
                                            disabled={updating}
                                            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold border border-red-200 transition disabled:opacity-50"
                                        >
                                            <XCircle size={16} /> Cancel Order
                                        </button>
                                    )}

                                    {/* Show cancelled status */}
                                    {order.status === 'Cancelled' && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                                            <p className="text-sm font-bold text-red-700 flex items-center justify-center gap-2">
                                                <XCircle size={16} /> Order Cancelled
                                            </p>
                                        </div>
                                    )}

                                    {/* Show delivered status */}
                                    {order.status === 'Delivered' && (
                                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                                            <p className="text-sm font-bold text-green-700 flex items-center justify-center gap-2">
                                                <CheckCircle size={16} /> Order Delivered
                                            </p>
                                        </div>
                                    )}

                                    {/* Info message if no shipment yet */}
                                    {order.shipmentStatus !== 'Created' && order.status !== 'Cancelled' && (
                                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                                            <p className="text-xs text-yellow-700">
                                                Create shipment to enable tracking updates
                                            </p>
                                        </div>
                                    )}
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
                                            <button
                                                onClick={() => {
                                                    const phoneStr = order.customer.phone || '';
                                                    const phone = phoneStr.toString().replace(/\D/g, '');

                                                    if (!phone) {
                                                        alert("No phone number found for this customer");
                                                        return;
                                                    }

                                                    // Assuming India +91 if not present, but for now just use what's there if it looks long enough, or default to 91
                                                    const formattedPhone = phone.length === 10 ? `91${phone}` : phone;

                                                    const itemsList = order.products?.map((item: any) =>
                                                        `- ${item.product?.name || 'Item'} (x${item.quantity})`
                                                    ).join('\n') || 'No items';

                                                    const message = `Hello ${order.customer.name},
Thank you for ordering!

Order Details:
${itemsList}

Total: ₹${order.totalPrice}

Can I confirm your order?

Visit us: ${window.location.origin}`;

                                                    const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
                                                    window.open(url, '_blank');
                                                }}
                                                className="text-green-600 hover:text-green-700 font-bold text-xs flex items-center gap-1 border border-green-200 bg-green-50 px-2 py-1 rounded"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
                                                WhatsApp
                                            </button>
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

