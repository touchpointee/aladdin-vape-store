"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

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

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <div className="min-h-screen w-full bg-gray-100 flex flex-col md:flex-row font-sans">

            {/* Mobile Header */}
            <header className="md:hidden bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sticky top-0 z-20">
                <span className="text-lg font-bold text-gray-800">Admin Portal</span>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Sidebar - Desktop (Fixed) & Mobile (Overlay) */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:flex flex-col
                    ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                <div className="h-16 flex items-center justify-center border-b border-gray-100">
                    <h1 className="text-xl font-bold text-gray-800">Admin Portal</h1>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {[
                        { href: "/admin/dashboard", label: "Dashboard" },
                        { href: "/admin/products", label: "Products" },
                        { href: "/admin/categories", label: "Categories" },
                        { href: "/admin/brands", label: "Brands" },
                        { href: "/admin/orders", label: "Orders" },
                        { href: "/admin/settings", label: "Settings" }
                    ].map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`block px-4 py-2 rounded-lg transition-colors ${pathname === link.href ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}

                    <div className="pt-4 mt-4 border-t border-gray-100 space-y-1">
                        <button
                            onClick={handleLogout}
                            className="w-full text-left block px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                            Logout
                        </button>
                        <Link href="/" target="_blank" className="block px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            View Store
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Overlay for mobile when menu is open */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Content Area */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 h-[calc(100vh-64px)] md:h-screen">
                <div className="w-full px-4 py-6 md:px-8 md:py-8">
                    {children}
                </div>
            </main>
        </div>
    );

}
