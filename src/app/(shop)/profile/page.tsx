"use client";

import Link from "next/link";
import { ArrowLeft, User, Camera } from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
    const [profile, setProfile] = useState({
        name: "Guest User",
        email: "guest@example.com",
        phone: "+91 9876543210"
    });

    const [loading, setLoading] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => setLoading(false), 1000); // Mock save
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-safe">
            <div className="bg-white p-4 flex items-center gap-4 border-b sticky top-0 z-10">
                <Link href="/account">
                    <ArrowLeft size={24} className="text-gray-600" />
                </Link>
                <h1 className="text-lg font-bold text-gray-900">Edit Profile</h1>
            </div>

            <div className="p-4">
                {/* Avatar */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 relative mb-3">
                        <User size={40} />
                        <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full border-2 border-white">
                            <Camera size={14} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                            <input
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-blue-500 outline-none font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email (Optional)</label>
                            <input
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                className="w-full border-b border-gray-200 py-2 text-sm focus:border-blue-500 outline-none font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                            <input
                                value={profile.phone}
                                readOnly
                                className="w-full border-b border-gray-200 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Phone number cannot be changed.</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl uppercase tracking-wide disabled:opacity-50 hover:bg-blue-700 transition"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </div>
        </div>
    );
}
