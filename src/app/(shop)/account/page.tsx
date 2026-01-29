import Link from "next/link";
import { Package, User, MapPin, Heart, HelpCircle, LogOut, ChevronRight } from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AccountPage() {
    const { user, isLoggedIn, logout } = useAuthStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const menuItems = [
        { icon: Package, label: "My Orders", href: "/orders", desc: "View your order history" },
        { icon: User, label: "My Profile", href: "/profile", desc: "Edit your name and phone" },
        { icon: MapPin, label: "Saved Addresses", href: "/addresses", desc: "Manage shipping addresses" },
        { icon: Heart, label: "My Wishlist", href: "/wishlist", desc: "View your saved items" },
        { icon: HelpCircle, label: "Help & Support", href: "/help", desc: "FAQs and Contact Support" },
    ];

    if (!mounted) return null;

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white p-6 pb-8 border-b">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">My Account</h1>
                <p className="text-sm text-gray-500">
                    {isLoggedIn ? `Welcome back, User` : "Welcome back, Guest!"}
                </p>
                {isLoggedIn && user?.phone && (
                    <p className="text-xs text-blue-600 font-bold mt-1">{user.phone}</p>
                )}
            </div>

            {/* Menu Grid */}
            <div className="p-4 flex flex-col gap-3 -mt-4">
                {!isLoggedIn && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 text-center mb-4">
                        <p className="text-gray-600 text-sm mb-4">Login to view your orders and profile.</p>
                        <Link href="/login" className="block w-full bg-blue-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-blue-200">
                            Login / Sign Up
                        </Link>
                    </div>
                )}

                {isLoggedIn && menuItems.map((item, index) => (
                    <Link href={item.href} key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 active:scale-[0.98] transition-transform">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                            <item.icon size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-gray-900">{item.label}</h3>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                    </Link>
                ))}

                {/* Logout Button */}
                {isLoggedIn ? (
                    <button onClick={logout} className="mt-4 w-full bg-white p-4 rounded-xl shadow-sm border border-red-100 flex items-center gap-4 active:scale-[0.98] transition-transform">
                        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                            <LogOut size={20} />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="text-sm font-bold text-red-500">Logout</h3>
                            <p className="text-xs text-red-300">Sign out of your account</p>
                        </div>
                    </button>
                ) : null}
            </div>
        </div>
    );
}
