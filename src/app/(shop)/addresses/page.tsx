"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Trash2, Edit2, Plus, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function AddressesPage() {
    const { user, isLoggedIn } = useAuthStore();
    const router = useRouter();
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        landmark: "",
        city: "",
        pincode: "",
        age: ""
    });

    useEffect(() => {
        if (!isLoggedIn) {
            router.push("/login");
            return;
        }
        if (user?.phone) {
            fetchAddresses(user.phone);
            setFormData(prev => ({ ...prev, phone: user.phone, name: user.name || "" }));
        }
    }, [isLoggedIn, user, router]);

    const fetchAddresses = async (phone: string) => {
        try {
            const res = await fetch(`/api/addresses?phone=${phone}`);
            if (res.ok) {
                const data = await res.json();
                setAddresses(data);
            }
        } catch (error) {
            console.error("Failed to load addresses");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: user?.name || "",
            phone: user?.phone || "",
            email: "",
            address: "",
            landmark: "",
            city: "",
            pincode: "",
            age: ""
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (addr: any) => {
        setFormData({
            name: addr.name,
            phone: addr.phone,
            email: addr.email,
            address: addr.address,
            landmark: addr.landmark || "",
            city: addr.city,
            pincode: addr.pincode,
            age: addr.age
        });
        setEditingId(addr._id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this address?")) return;

        try {
            const res = await fetch(`/api/addresses?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setAddresses(prev => prev.filter(a => a._id !== id));
            }
        } catch (error) {
            alert("Failed to delete address");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const phoneDigits = formData.phone.replace(/\D/g, '').replace(/^0+/, '');
        if (phoneDigits.length !== 10) {
            alert('Please enter a valid 10-digit mobile number');
            return;
        }
        if (phoneDigits.startsWith('0')) {
            alert('Phone number cannot start with 0');
            return;
        }
        setActionLoading(true);

        try {
            const url = '/api/addresses';
            const method = editingId ? 'PUT' : 'POST';
            const body = editingId ? { ...formData, phone: phoneDigits, _id: editingId } : { ...formData, phone: phoneDigits };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                if (user?.phone) fetchAddresses(user.phone);
                resetForm();
            } else {
                alert("Failed to save address");
            }
        } catch (error) {
            alert("Something went wrong");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
                <Link href="/account">
                    <ArrowLeft size={24} className="text-gray-600" />
                </Link>
                <h1 className="text-lg font-bold text-gray-900">Saved Addresses</h1>
            </div>

            <div className="p-4 max-w-lg mx-auto">

                {/* Form Section */}
                {showForm ? (
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-sm font-bold text-gray-900 uppercase">{editingId ? 'Edit Address' : 'Add New Address'}</h2>
                            <button onClick={resetForm} className="text-xs text-gray-500 underline">Cancel</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border-b border-gray-200 py-2 text-sm focus:border-blue-500 outline-none"
                                    placeholder="Name"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                                    <div className="flex items-center border-b border-gray-200 focus-within:border-blue-500">
                                        <span className="text-gray-600 text-sm font-medium pr-2">+91</span>
                                        <input
                                            required
                                            type="tel"
                                            inputMode="numeric"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 10) })}
                                            className="flex-1 min-w-0 border-0 border-b border-transparent py-2 text-sm focus:outline-none focus:border-blue-500 bg-transparent"
                                            placeholder="10-digit mobile number"
                                        />
                                    </div>
                                </div>
                                <div className="w-20">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Age</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.age}
                                        onChange={e => setFormData({ ...formData, age: e.target.value })}
                                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-blue-500 outline-none"
                                        placeholder="Age"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full border-b border-gray-200 py-2 text-sm focus:border-blue-500 outline-none"
                                    placeholder="Email"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
                                <input
                                    required
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full border-b border-gray-200 py-2 text-sm focus:border-blue-500 outline-none"
                                    placeholder="Flat, House No, Building, Apartment"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Landmark</label>
                                <input
                                    value={formData.landmark}
                                    onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                                    className="w-full border-b border-gray-200 py-2 text-sm focus:border-blue-500 outline-none"
                                    placeholder="Near..."
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City</label>
                                    <input
                                        required
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-blue-500 outline-none"
                                        placeholder="City"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pincode</label>
                                    <input
                                        required
                                        value={formData.pincode}
                                        onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                                        className="w-full border-b border-gray-200 py-2 text-sm focus:border-blue-500 outline-none"
                                        placeholder="Pincode"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg mt-4 disabled:opacity-70"
                            >
                                {actionLoading ? 'Saving...' : (editingId ? 'Update Address' : 'Save Address')}
                            </button>
                        </form>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowForm(true)}
                        className="w-full bg-white border-2 border-dashed border-blue-200 text-blue-600 font-bold p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-50 transition mb-6"
                    >
                        <Plus size={20} /> Add New Address
                    </button>
                )}

                {/* Address List */}
                <div className="space-y-4">
                    {addresses.map((addr) => (
                        <div key={addr._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative group">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 text-blue-600">
                                    <MapPin size={20} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900">{addr.name} <span className="text-gray-400 text-xs font-normal">({addr.age} Yrs)</span></h3>
                                    <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                                        {addr.address}<br />
                                        {addr.landmark && <>{addr.landmark}, <br /></>}
                                        {addr.city}, {addr.pincode}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">{addr.phone}</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-50">
                                <button
                                    onClick={() => handleEdit(addr)}
                                    className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition"
                                >
                                    <Edit2 size={12} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(addr._id)}
                                    className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition"
                                >
                                    <Trash2 size={12} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}

                    {addresses.length === 0 && !showForm && (
                        <div className="text-center py-12 text-gray-400">
                            <MapPin size={40} className="mx-auto mb-3 opacity-20" />
                            <p>No saved addresses found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
