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
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: '',
        city: '',
        pincode: ''
    });

    // Fetch saved addresses on mount if logged in
    useEffect(() => {
        if (isLoggedIn && user?.phone) {
            setFormData(prev => ({ ...prev, phone: user.phone }));
            fetchAddresses(user.phone);
        }
    }, [isLoggedIn, user]);

    const fetchAddresses = async (phone: string) => {
        try {
            const res = await fetch(`/api/addresses?phone=${phone}`);
            if (res.ok) {
                const data = await res.json();
                setSavedAddresses(data);
                // Pre-fill with first address if available
                if (data.length > 0) {
                    fillAddress(data[0]);
                } else {
                    setShowNewAddressForm(true);
                }
            }
        } catch (error) {
            console.error("Failed to load addresses");
        }
    };

    const fillAddress = (addr: any) => {
        setFormData({
            name: addr.name || formData.name, // Keep existing name if addr name is missing/different context
            phone: addr.phone,
            address: addr.address,
            city: addr.city,
            pincode: addr.pincode
        });
        setShowNewAddressForm(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
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

            // 2. Save Address (Side Effect - Fire and forget mostly, or wait)
            // We save if it's a new address (simple logic: check if it matches any saved ID? Or just always save new entry?)
            // For this minimal flow, let's just save it as a new entry if the user is logged in
            if (isLoggedIn && user?.phone) {
                await fetch('/api/addresses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        phone: user.phone,
                        name: formData.name,
                        address: formData.address,
                        city: formData.city,
                        pincode: formData.pincode
                    })
                });
            }

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
                                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${formData.address === addr.address ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <MapPin className={`mt-0.5 ${formData.address === addr.address ? 'text-blue-600' : 'text-gray-400'}`} size={18} />
                                        <div>
                                            <p className="font-bold text-sm text-gray-900">{addr.name}</p>
                                            <p className="text-sm text-gray-600 leading-snug">{addr.address}, {addr.city} - {addr.pincode}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => {
                                    setFormData({ ...formData, address: '', city: '', pincode: '' });
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
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                                    <input
                                        name="phone" required type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-500 outline-none"
                                        placeholder="+91 9876543210"
                                        readOnly={!!isLoggedIn} // If logged in, lock phone to ensure order linking
                                    />
                                    {isLoggedIn && <p className="text-[10px] text-gray-400 mt-1">Phone number linked to account.</p>}
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
