import Link from "next/link";
import { Package, User, MapPin, Heart, HelpCircle, LogOut, ChevronRight } from "lucide-react";

export default function AccountPage() {
    // Ideally, we check auth state here. For now, we assume access or redirect logic will handle it.
    // Since the requirement says "Guest-first", we display this page but maybe prompt login if needed for specific actions?
    // Or this page IS the logged-in view.

    const menuItems = [
        { icon: Package, label: "My Orders", href: "/orders", desc: "View your order history" },
        { icon: User, label: "My Profile", href: "/profile", desc: "Edit your name and phone" },
        { icon: MapPin, label: "Saved Addresses", href: "/addresses", desc: "Manage shipping addresses" },
        { icon: Heart, label: "My Wishlist", href: "/wishlist", desc: "View your saved items" },
        { icon: HelpCircle, label: "Help & Support", href: "/help", desc: "FAQs and Contact Support" },
    ];

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white p-6 pb-8 border-b">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">My Account</h1>
                <p className="text-sm text-gray-500">Welcome back, Guest!</p>
            </div>

            {/* Menu Grid */}
            <div className="p-4 flex flex-col gap-3 -mt-4">
                {menuItems.map((item, index) => (
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
                <Link href="/login" className="mt-4 bg-white p-4 rounded-xl shadow-sm border border-red-100 flex items-center gap-4 active:scale-[0.98] transition-transform">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                        <LogOut size={20} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-red-500">Log In / Sign Up</h3>
                        <p className="text-xs text-red-300">Access your account</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
