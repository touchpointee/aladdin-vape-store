"use client";

import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
    const { items, subtotal, clearCart } = useCartStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        pincode: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
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

            <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-6">
                {/* Contact Info */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h2 className="text-sm font-bold text-gray-900 uppercase mb-4">Contact Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                            <input
                                name="name" required
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-500 outline-none"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                            <input
                                name="phone" required type="tel"
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-500 outline-none"
                                placeholder="+91 9876543210"
                            />
                        </div>
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h2 className="text-sm font-bold text-gray-900 uppercase mb-4">Shipping Address</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
                            <input
                                name="address" required
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
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-500 outline-none"
                                    placeholder="City"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pincode</label>
                                <input
                                    name="pincode" required
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-500 outline-none"
                                    placeholder="123456"
                                />
                            </div>
                        </div>
                    </div>
                </div>

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
    );
}
