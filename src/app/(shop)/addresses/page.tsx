"use client";

import Link from "next/link";
import { ArrowLeft, MapPin, Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function AddressesPage() {
    const { user, isLoggedIn } = useAuthStore();
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isLoggedIn && user?.phone) {
            fetch(`/api/addresses?phone=${user.phone}`)
                .then(res => res.json())
                .then(data => {
                    setAddresses(Array.isArray(data) ? data : []);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [isLoggedIn, user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-safe">
            <div className="bg-white p-4 flex items-center gap-4 border-b sticky top-0 z-10">
                <Link href="/account">
                    <ArrowLeft size={24} className="text-gray-600" />
                </Link>
                <h1 className="text-lg font-bold text-gray-900">Saved Addresses</h1>
            </div>

            <div className="p-4 space-y-4">
                {!isLoggedIn ? (
                    <div className="text-center py-20 text-gray-500">
                        <p>Login to view saved addresses.</p>
                        <Link href="/login" className="text-blue-600 font-bold mt-2 inline-block">Login Now</Link>
                    </div>
                ) : addresses.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <MapPin size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No saved addresses.</p>
                    </div>
                ) : (
                    addresses.map((addr) => (
                        <div key={addr._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative group">
                            <div className="flex items-start gap-3">
                                <MapPin className="text-blue-500 mt-1 shrink-0" size={20} />
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase mb-1">{addr.name}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-2">{addr.address}, {addr.city} - {addr.pincode}</p>
                                    <p className="text-xs text-gray-500 font-semibold">Phone: {addr.phone}</p>
                                </div>
                            </div>

                            {/* Actions (Future implementation) */}
                            {/* <div className="mt-4 flex gap-3 border-t pt-3">
                                <button className="flex-1 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded flex items-center justify-center gap-2">
                                    <Edit2 size={12} /> Edit
                                </button>
                                <button className="flex-1 py-1.5 text-xs font-bold text-red-600 bg-red-50 rounded flex items-center justify-center gap-2">
                                    <Trash2 size={12} /> Delete
                                </button>
                            </div> */}
                        </div>
                    ))
                )}

                {/* Adding new address happens via Checkout for now to keep flow simple, or we can add a form here later */}
                {isLoggedIn && (
                    <Link href="/" className="w-full py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold flex items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors">
                        <Plus size={20} /> Shop & Add Address
                    </Link>
                )}
            </div>
        </div>
    );
}
