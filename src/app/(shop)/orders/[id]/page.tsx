import Link from "next/link";
import { ArrowLeft, MapPin, Truck, CreditCard, ShoppingBag } from "lucide-react";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Image from "next/image";

export const dynamic = 'force-dynamic';

async function getOrder(id: string) {
    await connectDB();
    const order = await Order.findById(id).populate('products.product').lean();
    if (!order) return null;

    return {
        ...order,
        _id: order._id.toString(),
        products: order.products.filter((p: any) => p.product).map((p: any) => ({
            ...p,
            _id: p._id?.toString(), // Subdocument ID
            product: {
                ...p.product,
                _id: p.product._id.toString()
            }
        }))
    };
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const order = await getOrder(id);

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
                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                            <Truck size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">{order.status}</p>
                            <p className="text-xs text-gray-500">Order placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    {/* Simple Timeline (Static for now) */}
                    <div className="pl-5 border-l-2 border-gray-100 space-y-4 relative">
                        <div className="relative">
                            <div className="absolute -left-[25px] top-1 w-3 h-3 bg-green-500 rounded-full ring-4 ring-white"></div>
                            <p className="text-xs font-bold text-gray-900">Order Placed</p>
                            <p className="text-[10px] text-gray-400">Your order has been received</p>
                        </div>
                        {order.status !== 'Pending' && (
                            <div className="relative">
                                <div className="absolute -left-[25px] top-1 w-3 h-3 bg-green-500 rounded-full ring-4 ring-white"></div>
                                <p className="text-xs font-bold text-gray-900">Dispatched</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Items */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <ShoppingBag size={16} /> Items ({order.products.length})
                    </h3>
                    <div className="space-y-4">
                        {order.products.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-3">
                                <div className="w-16 h-16 relative border rounded bg-gray-50 shrink-0">
                                    <Image
                                        src={item.product.images?.[0] || '/placeholder.png'}
                                        alt={item.product.name}
                                        fill
                                        className="object-contain p-1"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-800 line-clamp-1">{item.product.name}</h4>
                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                    <p className="text-sm font-bold text-gray-900 mt-1">₹{item.price * item.quantity}</p>
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
                        <p className="font-bold text-gray-900">{order.customer.name}</p>
                        <p>{order.customer.address}</p>
                        <p>{order.customer.city} - {order.customer.pincode}</p>
                        <p className="mt-1 font-semibold">Phone: {order.customer.phone}</p>
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
                            <span>₹{order.totalPrice}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                            <span>Shipping</span>
                            <span className="text-green-600">Free</span>
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
