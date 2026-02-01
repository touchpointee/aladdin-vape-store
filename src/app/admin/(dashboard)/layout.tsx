"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { urlBase64ToUint8Array } from "@/lib/notifications";

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

    // Register Service Worker and Setup Web Push
    useEffect(() => {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
            console.log("Push notifications not supported");
            return;
        }

        const registerAndSubscribe = async () => {
            try {
                // Register Service Worker
                const registration = await navigator.serviceWorker.register("/sw.js");
                console.log("Service Worker registered");

                // Request permission
                const permission = await Notification.requestPermission();
                if (permission !== "granted") return;

                // Subscribe to Push
                const subscribeOptions = {
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
                };

                let subscription = await registration.pushManager.getSubscription();

                if (!subscription) {
                    subscription = await registration.pushManager.subscribe(subscribeOptions);
                }

                // Send subscription to server
                await fetch("/api/admin/notifications/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ subscription })
                });

            } catch (error) {
                console.error("Push registration failed:", error);
            }
        };

        registerAndSubscribe();
    }, []);


    // Admin Notifications Polling (Keep for foreground sound/instant UI)
    useEffect(() => {
        // Request notification permission if not already granted
        if ("Notification" in window) {
            if (Notification.permission !== "granted" && Notification.permission !== "denied") {
                Notification.requestPermission();
            }
        }

        let lastOrderId = localStorage.getItem('last_seen_order_id');

        const checkNewOrders = async () => {
            try {
                const res = await fetch('/api/admin/orders/latest');
                if (res.ok) {
                    const data = await res.json();

                    if (data.latestOrderId && data.latestOrderId !== lastOrderId) {
                        // NEW ORDER DETECTED!

                        // If it's the very first load, just store the ID and don't notify
                        if (!lastOrderId) {
                            lastOrderId = data.latestOrderId;
                            localStorage.setItem('last_seen_order_id', data.latestOrderId);
                            return;
                        }

                        // Update local ref and storage
                        lastOrderId = data.latestOrderId;
                        localStorage.setItem('last_seen_order_id', data.latestOrderId);

                        // Trigger notification
                        if (Notification.permission === "granted") {
                            const notification = new Notification("🏪 New Order Received!", {
                                body: `A new order has been placed. Check the orders dashboard.`,
                                icon: "/favicon.ico",
                                tag: "new-order",
                                requireInteraction: true
                            });

                            notification.onclick = () => {
                                window.focus();
                                router.push('/admin/orders');
                                notification.close();
                            };

                            // Play configured sound if enabled
                            try {
                                const settingsRes = await fetch('/api/admin/settings');
                                if (settingsRes.ok) {
                                    const settings = await settingsRes.json();
                                    if (settings.notification_sound_enabled !== false) {
                                        const audio = new Audio(settings.notification_sound_url || "https://assets.mixkit.co/active_storage/sfx/1013/1013-preview.mp3");
                                        audio.play().catch(e => {
                                            console.warn("Autoplay blocked by browser. Sound will play after user interaction.", e);
                                        });
                                    }
                                }
                            } catch (e) {
                                console.log("Audio play failed:", e);
                            }
                        }
                    } else if (data.latestOrderId) {
                        // Update storage even if same, just to be sure
                        localStorage.setItem('last_seen_order_id', data.latestOrderId);
                        lastOrderId = data.latestOrderId;
                    }
                }
            } catch (error) {
                console.error("Failed to check for new orders", error);
            }
        };

        // Check immediately on load
        checkNewOrders();

        // Then poll every 30 seconds
        const interval = setInterval(checkNewOrders, 30000);

        return () => clearInterval(interval);
    }, [router]);

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
