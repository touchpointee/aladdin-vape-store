import connectDB, { Order } from "@/lib/db";
import { Order as OrderModel } from "@/models/all";
import Link from "next/link";

export const dynamic = 'force-dynamic';

async function getOrders() {
    await connectDB();
    const orders = await OrderModel.find({}).populate('products.product').sort({ createdAt: -1 });
    return orders;
}

export default async function AdminOrdersPage() {
    const orders = await getOrders();

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Orders</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
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
                        {orders.map((order: any) => (
                            <tr key={order._id} className="border-b hover:bg-gray-50">
                                <td className="p-4 text-xs font-mono text-gray-600">{order._id.toString().substring(0, 8)}...</td>
                                <td className="p-4 text-sm">
                                    <div className="font-bold">{order.customer.name}</div>
                                    <div className="text-xs text-gray-500">{order.customer.phone}</div>
                                </td>
                                <td className="p-4 font-bold">₹{order.totalPrice}</td>
                                <td className="p-4 text-sm">{order.paymentMode}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs rounded ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                order.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
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
                {orders.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No orders found.</div>
                )}
            </div>
        </div >
    );
}
