import connectDB from "@/lib/db";
import { Order as OrderModel } from "@/models/all";
import OrdersTable from "./OrdersTable";

export const dynamic = 'force-dynamic';

async function getOrders() {
    await connectDB();
    const orders = await OrderModel.find({}).populate('products.product').sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(orders)); // Serialize for client component
}

export default async function AdminOrdersPage() {
    const orders = await getOrders();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Orders</h1>
            <OrdersTable initialOrders={orders} />
        </div>
    );
}
