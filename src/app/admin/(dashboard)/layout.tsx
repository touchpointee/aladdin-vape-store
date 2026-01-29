"use client";

import { useRouter } from "next/navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/admin/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-100 flex font-sans">
            {/* Simple Admin Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col flex-shrink-0">
                <div className="h-16 flex items-center justify-center border-b border-gray-100">
                    <h1 className="text-xl font-bold text-gray-800">Admin Portal</h1>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    <a href="/admin/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Dashboard</a>
                    <a href="/admin/products" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Products</a>
                    <a href="/admin/categories" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Categories</a>
                    <a href="/admin/brands" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Brands</a>
                    <a href="/admin/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Orders</a>
                    <a href="/admin/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Settings</a>
                    <div className="pt-4 mt-4 border-t border-gray-100">
                        <button
                            onClick={handleLogout}
                            className="w-full text-left block px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                            Logout
                        </button>
                        <a href="/" target="_blank" className="block px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">View Store</a>
                    </div>
                </nav>
            </aside>

            {/* Content Area */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                <div className="w-full px-6 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
