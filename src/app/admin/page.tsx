import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";

// Use dynamic to ensure fresh data
export const dynamic = 'force-dynamic';

async function getStats() {
    await connectDB();
    const totalOrders = await Order.countDocuments({});
    const totalProducts = await Product.countDocuments({});
    // Calculate revenue
    const orders = await Order.find({ status: { $ne: 'Cancelled' } });
    const revenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);

    const pendingOrders = await Order.countDocuments({ status: 'Pending' });

    return { totalOrders, totalProducts, revenue, pendingOrders };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

            <div className="grid grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-gray-500 text-sm uppercase font-bold">Total Revenue</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">₹{stats.revenue.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-gray-500 text-sm uppercase font-bold">Total Orders</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-gray-500 text-sm uppercase font-bold">Pending Orders</h3>
                    <p className="text-2xl font-bold text-orange-500 mt-2">{stats.pendingOrders}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-gray-500 text-sm uppercase font-bold">Total Products</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
                </div>
            </div>
        </div>
    );
}
