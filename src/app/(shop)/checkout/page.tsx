"use client";

import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, MapPin, Plus } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
    const { items, subtotal, clearCart } = useCartStore();
    const { user, isLoggedIn } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        email: '',
        address: '',
        landmark: '',
        city: '',
        pincode: '',
        age: ''
    });

    // ... existing useEffect ...

    // ... existing fetchAddresses ...

    const fillAddress = (addr: any) => {
        setFormData({
            name: addr.name || formData.name,
            phone: addr.phone,
            email: addr.email || '',
            address: addr.address,
            landmark: addr.landmark || '',
            city: addr.city,
            pincode: addr.pincode,
            age: addr.age || ''
        });
        setSelectedAddressId(addr._id);
        setShowNewAddressForm(false);
        setEditingId(null); // Reset editing when just selecting
    };

    // ... existing handleChange ...

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 0. Update Address (if in edit mode) or Create New Address (if new)
            // We do this BEFORE creating the order to ensure correct address details are saved
            if (showNewAddressForm && isLoggedIn && user?.phone) {
                const url = '/api/addresses';
                const method = editingId ? 'PUT' : 'POST';
                const body = editingId ? { ...formData, _id: editingId } : { ...formData, phone: user.phone };

                const addrRes = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (addrRes.ok) {
                    // Refresh addresses to get the latest ID if new, or update list
                    await fetchAddresses(user.phone);
                }
            }

            // 1. Create Order
            const orderData = {
                customer: formData,
                products: items.map(item => ({
                    product: item.id,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalPrice: subtotal(),
                paymentMode: 'COD'
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (!res.ok) throw new Error('Order failed');

            setSuccess(true);
            clearCart();
        } catch (error) {
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={40} className="text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                <p className="text-gray-500 mb-8">Thank you for your purchase. We will ship your order soon.</p>
                <Link href="/" className="bg-blue-500 text-white px-8 py-3 rounded-full font-bold uppercase hover:bg-blue-600">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
                <Link href="/" className="text-blue-500 font-bold underline">Go to Shop</Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white p-4 flex items-center gap-4 shadow-sm">
                <Link href="/">
                    <ArrowLeft size={24} className="text-gray-600" />
                </Link>
                <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
            </div>

            <div className="p-4 flex flex-col gap-6">

                {/* Saved Addresses Selection */}
                {isLoggedIn && savedAddresses.length > 0 && (
                    <div>
                        <h2 className="text-sm font-bold text-gray-900 uppercase mb-3">Saved Addresses</h2>
                        <div className="flex flex-col gap-3">
                            {savedAddresses.map((addr) => (
                                <div
                                    key={addr._id}
                                    onClick={() => fillAddress(addr)}
                                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedAddressId === addr._id ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <MapPin className={`mt-0.5 ${selectedAddressId === addr._id ? 'text-blue-600' : 'text-gray-400'}`} size={18} />
                                        <div className="flex-1">
                                            <p className="font-bold text-sm text-gray-900">{addr.name} ({addr.age} Yrs)</p>
                                            <p className="text-sm text-gray-600 leading-snug">{addr.address}, {addr.landmark && `${addr.landmark}, `}{addr.city} - {addr.pincode}</p>
                                            <p className="text-xs text-gray-500 mt-1">{addr.email}</p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                fillAddress(addr);
                                                setEditingId(addr._id);
                                                setShowNewAddressForm(true);
                                                setFormData({
                                                    name: addr.name,
                                                    phone: addr.phone,
                                                    email: addr.email,
                                                    address: addr.address,
                                                    landmark: addr.landmark || '',
                                                    city: addr.city,
                                                    pincode: addr.pincode,
                                                    age: addr.age,
                                                });
                                            }}
                                            className="p-1.5 hover:bg-gray-100 rounded text-blue-600 text-xs font-bold"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => {
                                    setFormData({ ...formData, email: '', address: '', landmark: '', city: '', pincode: '', age: '' });
                                    setSelectedAddressId(null);
                                    setEditingId(null);
                                    setShowNewAddressForm(true);
                                }}
                                className="p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold text-sm flex items-center justify-center gap-2 hover:border-blue-400 hover:text-blue-600"
                            >
                                <Plus size={16} /> Add New Address
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Shipping Address Form */}
                    {(showNewAddressForm || savedAddresses.length === 0) && (
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h2 className="text-sm font-bold text-gray-900 uppercase mb-4">Enter Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                    <input
                                        name="name" required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-500 outline-none"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                                    <input
                                        name="email" required type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-500 outline-none"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                                        <input
                                            name="phone" required type="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-500 outline-none"
                                            placeholder="+91 9876543210"
                                        />
                                    </div>
                                    <div className="w-24">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Age</label>
                                        <input
                                            name="age" required type="number"
                                            value={formData.age}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-500 outline-none"
                                            placeholder="21"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
                                    <input
                                        name="address" required
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-500 outline-none"
                                        placeholder="House No, Street Area"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Landmark</label>
                                    <input
                                        name="landmark"
                                        value={formData.landmark}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-500 outline-none"
                                        placeholder="Near Park, Behind Temple etc."
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City</label>
                                        <input
                                            name="city" required
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-500 outline-none"
                                            placeholder="City"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pincode</label>
                                        <input
                                            name="pincode" required
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-500 outline-none"
                                            placeholder="123456"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Method */}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h2 className="text-sm font-bold text-gray-900 uppercase mb-4">Payment Method</h2>
                        <div className="flex items-center gap-3 p-3 border border-blue-500 bg-blue-50 rounded">
                            <div className="w-4 h-4 rounded-full border-4 border-blue-500"></div>
                            <span className="text-sm font-bold text-gray-900">Cash on Delivery (COD)</span>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h2 className="text-sm font-bold text-gray-900 uppercase mb-4">Order Summary</h2>
                        <div className="space-y-2 mb-4">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-gray-600">{item.name} x {item.quantity}</span>
                                    <span className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-3 flex justify-between items-center">
                            <span className="text-base font-bold text-gray-900">Total</span>
                            <span className="text-xl font-bold text-red-500">₹{subtotal().toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white font-bold uppercase py-4 rounded shadow-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Confirm Order'}
                    </button>
                </form>
            </div>
        </div>
    );
}
