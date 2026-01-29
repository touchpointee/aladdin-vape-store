"use client";

import Link from "next/link";
import { ArrowLeft, MapPin, Plus, Trash2, Edit2 } from "lucide-react";
import { useState } from "react";

export default function AddressesPage() {
    // Addresses state (Currently empty as we don't have persistence yet)
    const [addresses, setAddresses] = useState<any[]>([]);

    return (
        <div className="bg-gray-50 min-h-screen pb-safe">
            <div className="bg-white p-4 flex items-center gap-4 border-b sticky top-0 z-10">
                <Link href="/account">
                    <ArrowLeft size={24} className="text-gray-600" />
                </Link>
                <h1 className="text-lg font-bold text-gray-900">Saved Addresses</h1>
            </div>

            <div className="p-4 space-y-4">
                {addresses.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <MapPin size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No saved addresses.</p>
                    </div>
                ) : (
                    addresses.map((addr) => (
                        <div key={addr.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative group">
                            <div className="flex items-start gap-3">
                                <MapPin className="text-blue-500 mt-1 shrink-0" size={20} />
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase mb-1">{addr.name}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-2">{addr.text}</p>
                                    <p className="text-xs text-gray-500 font-semibold">Phone: {addr.phone}</p>
                                </div>
                            </div>

                            <div className="mt-4 flex gap-3 border-t pt-3">
                                <button className="flex-1 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded flex items-center justify-center gap-2">
                                    <Edit2 size={12} /> Edit
                                </button>
                                <button className="flex-1 py-1.5 text-xs font-bold text-red-600 bg-red-50 rounded flex items-center justify-center gap-2">
                                    <Trash2 size={12} /> Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}

                <button className="w-full py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold flex items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors">
                    <Plus size={20} /> Add New Address
                </button>
            </div>
        </div>
    );
}
