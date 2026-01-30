"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export default function OrdersTable({ initialOrders }: { initialOrders: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredOrders = initialOrders.filter((order) => {
        const query = searchQuery.toLowerCase();
        const orderId = order._id.toString().toLowerCase();
        const customerName = order.customer.name.toLowerCase();
        return orderId.includes(query) || customerName.includes(query);
    });

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search by Order ID or Customer Name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 text-sm font-medium text-gray-500">Order ID</th>
                                <th className="p-4 text-sm font-medium text-gray-500">Customer</th>
                                <th className="p-4 text-sm font-medium text-gray-500">Total</th>
                                <th className="p-4 text-sm font-medium text-gray-500">Payment</th>
                                <th className="p-4 text-sm font-medium text-gray-500">Status</th>
                                <th className="p-4 text-sm font-medium text-gray-500">Date</th>
                                <th className="p-4 text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order: any) => (
                                <tr key={order._id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 text-xs font-mono text-gray-600">
                                        {order._id.toString().substring(0, 8)}...
                                    </td>
                                    <td className="p-4 text-sm">
                                        <div className="font-bold">{order.customer.name}</div>
                                        <div className="text-xs text-gray-500">{order.customer.phone}</div>
                                    </td>
                                    <td className="p-4 font-bold">
                                        <div className="flex flex-col">
                                            <span>₹{order.totalPrice}</span>
                                            {(() => {
                                                const currentTotal = order.products?.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
                                                const originalTotal = order.products?.reduce((acc: number, item: any) => {
                                                    // item.originalPrice might be undefined if no discount or old order.
                                                    // If originalPrice exists and is > price, use it. Else use price.
                                                    const itemOriginalPrice = (item.originalPrice && item.originalPrice > item.price)
                                                        ? item.originalPrice
                                                        : item.price;
                                                    return acc + (itemOriginalPrice * item.quantity);
                                                }, 0);

                                                if (originalTotal > currentTotal) {
                                                    return (
                                                        <span className="text-xs text-gray-400 line-through">
                                                            ₹{originalTotal}
                                                        </span>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm">{order.paymentMode}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs rounded ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                order.status === 'Packed' ? 'bg-blue-100 text-blue-700' :
                                                    order.status === 'In Transit' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <Link href={`/admin/orders/${order._id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredOrders.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        {searchQuery ? "No matching orders found." : "No orders found."}
                    </div>
                )}
            </div>
        </div >
    );
}
