"use client";

import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, MapPin, Plus, CreditCard, Banknote, Copy, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const DELIVERY_CHARGE = 100;

export default function CheckoutPage() {
    const { items, subtotal, clearCart } = useCartStore();
    const { user, isLoggedIn } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Payment method state
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'PREPAID'>('COD');
    const [utrNumber, setUtrNumber] = useState('');
    const [paymentQrCode, setPaymentQrCode] = useState('');
    const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(true);
    const [showUtrModal, setShowUtrModal] = useState(false);

    // Fetch QR code and settings
    useEffect(() => {
        fetch('/api/settings?key=payment_qr_code')
            .then(res => res.json())
            .then(data => {
                if (data.value) {
                    setPaymentQrCode(data.value);
                }
            })
            .catch(err => console.error("Failed to fetch QR code", err));

        fetch('/api/settings?key=payment_settings')
            .then(res => res.json())
            .then(data => {
                if (data.value && data.value.online_enabled !== undefined) {
                    setOnlinePaymentEnabled(data.value.online_enabled);
                    // If online payment is disabled, ensure COD is selected
                    if (!data.value.online_enabled) {
                        setPaymentMethod('COD');
                    }
                }
            })
            .catch(err => console.error("Failed to fetch payment settings", err));
    }, []);

    // Sync prices on mount
    useEffect(() => {
        if (items.length > 0) {
            const ids = items.map(i => i.id).join(',');
            fetch(`/api/products?ids=${ids}`)
                .then(res => res.json())
                .then(data => {
                    const fetchedProducts = Array.isArray(data) ? data : (data.products || []);
                    useCartStore.getState().syncCartWithServer(fetchedProducts);
                })
                .catch(err => console.error("Failed to sync cart", err));
        }
    }, []);

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
        state: '',
        pincode: '',
        age: ''
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
            name: addr.name || formData.name,
            phone: addr.phone,
            email: addr.email || '',
            address: addr.address,
            landmark: addr.landmark || '',
            city: addr.city,
            state: addr.state || '',
            pincode: addr.pincode,
            age: addr.age || ''
        });
        setSelectedAddressId(addr._id);
        setShowNewAddressForm(false);
        setEditingId(null); // Reset editing when just selecting
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        if (e.target.name === 'phone') {
            value = value.replace(/\D/g, '').slice(0, 10);
        }
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate UTR for prepaid
        if (paymentMethod === 'PREPAID') {
            if (!utrNumber.trim() || utrNumber.trim().length !== 12) {
                alert('Please enter a valid 12-digit UTR number');
                setShowUtrModal(true);
                return;
            }
        }


        setLoading(true);

        try {
            // Normalize data for sending
            const normalizedData = {
                ...formData,
                phone: formData.phone.trim(),
                age: Number(formData.age)
            };

            // 0. Address Management (Save/Update)
            if (!isLoggedIn || showNewAddressForm) {
                const url = '/api/addresses';
                const method = (editingId && isLoggedIn) ? 'PUT' : 'POST';
                const body = (editingId && isLoggedIn)
                    ? { ...normalizedData, _id: editingId }
                    : { ...normalizedData };

                const addrRes = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (addrRes.ok) {
                    // Auto-login for guests
                    if (!isLoggedIn) {
                        const { login, updateUser } = useAuthStore.getState();
                        login(normalizedData.phone);
                        updateUser({ name: normalizedData.name });
                    }
                    if (isLoggedIn && user?.phone) {
                        await fetchAddresses(user.phone);
                    }
                } else {
                    const errData = await addrRes.json();
                    throw new Error(errData.error || 'Failed to save address');
                }
            }

            // 1. Create Order
            const orderData: any = {
                customer: normalizedData,
                products: items.map(item => ({
                    product: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    flavour: item.selectedFlavour,
                    nicotine: item.selectedNicotine
                })),
                totalPrice: subtotal() + DELIVERY_CHARGE,
                paymentMode: paymentMethod
            };

            // Add UTR for prepaid orders
            if (paymentMethod === 'PREPAID') {
                orderData.utrNumber = utrNumber.trim();
            }

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Order failed');
            }

            setSuccess(true);
            clearCart();
        } catch (error: any) {
            alert(error.message || "Something went wrong");
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
                <p className="text-gray-500 mb-8">
                    {paymentMethod === 'PREPAID'
                        ? 'Your payment is pending verification. We will confirm your order shortly.'
                        : 'Thank you for your purchase. We will ship your order soon.'}
                </p>
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
                                                    state: addr.state || '',
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
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">State</label>
                                        <input
                                            name="state" required
                                            value={formData.state}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-500 outline-none"
                                            placeholder="Kerala"
                                        />
                                    </div>
                                    <div className="w-24">
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

                    {/* Payment Method Selection */}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h2 className="text-sm font-bold text-gray-900 uppercase mb-4">Payment Method</h2>
                        <div className="space-y-3">
                            {/* COD Option */}
                            <div
                                onClick={() => setPaymentMethod('COD')}
                                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-blue-500' : 'border-gray-300'}`}>
                                    {paymentMethod === 'COD' && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
                                </div>
                                <Banknote size={20} className={paymentMethod === 'COD' ? 'text-blue-600' : 'text-gray-400'} />
                                <span className={`text-sm font-bold ${paymentMethod === 'COD' ? 'text-gray-900' : 'text-gray-600'}`}>Cash on Delivery (COD)</span>
                            </div>

                            {/* Prepaid/Online Option */}
                            {onlinePaymentEnabled && (
                                <div
                                    onClick={() => setPaymentMethod('PREPAID')}
                                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'PREPAID' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'PREPAID' ? 'border-green-500' : 'border-gray-300'}`}>
                                        {paymentMethod === 'PREPAID' && <div className="w-3 h-3 rounded-full bg-green-500"></div>}
                                    </div>
                                    <CreditCard size={20} className={paymentMethod === 'PREPAID' ? 'text-green-600' : 'text-gray-400'} />
                                    <span className={`text-sm font-bold ${paymentMethod === 'PREPAID' ? 'text-gray-900' : 'text-gray-600'}`}>Pay Online (UPI)</span>
                                </div>
                            )}
                        </div>

                        {/* QR Code and UTR Input for Prepaid */}
                        {paymentMethod === 'PREPAID' && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="text-center mb-4">
                                    <p className="text-sm text-gray-600 mb-3">Scan QR code to pay ₹{(subtotal() + DELIVERY_CHARGE).toFixed(2)}</p>
                                    {paymentQrCode ? (
                                        <div className="relative w-48 h-48 mx-auto bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
                                            <Image
                                                src={paymentQrCode}
                                                alt="Payment QR Code"
                                                fill
                                                className="object-contain p-2"
                                                sizes="200px"
                                                unoptimized
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                                            QR Code not available
                                        </div>
                                    )}
                                </div>

                                {/* I've Paid Button */}
                                <button
                                    type="button"
                                    onClick={() => setShowUtrModal(true)}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
                                >
                                    <CheckCircle size={20} />
                                    I've Paid - Enter UTR
                                </button>

                                {utrNumber.length === 12 && (
                                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                                        <p className="text-sm text-green-700 font-bold">✓ UTR: {utrNumber}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* UTR Popup Modal */}
                        {showUtrModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                {/* Backdrop */}
                                <div
                                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                                    onClick={() => setShowUtrModal(false)}
                                ></div>

                                {/* Modal Content */}
                                <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in duration-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-gray-900">Enter Payment Details</h3>
                                        <button
                                            type="button"
                                            onClick={() => setShowUtrModal(false)}
                                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm font-bold text-blue-800 mb-2">📱 Where to find UTR Number:</p>
                                        <ul className="text-xs text-blue-700 space-y-1.5">
                                            <li>• <strong>Google Pay:</strong> Payment history → Select transaction → "UPI transaction ID"</li>
                                            <li>• <strong>PhonePe:</strong> History → Select transaction → "Transaction ID"</li>
                                            <li>• <strong>Paytm:</strong> Passbook → Transaction → "UTR/Reference ID"</li>
                                            <li>• <strong>Bank SMS:</strong> Check the 12-digit number in payment confirmation SMS</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">UTR / Transaction ID (12 digits)</label>
                                        <input
                                            type="text"
                                            value={utrNumber}
                                            onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                                            className="w-full border-2 border-gray-300 rounded-lg p-4 text-xl font-mono tracking-widest focus:border-green-500 outline-none text-center"
                                            placeholder="000000000000"
                                            maxLength={12}
                                            autoFocus
                                        />
                                        <p className="text-xs text-gray-500 mt-2 text-center">
                                            {utrNumber.length}/12 digits entered
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setShowUtrModal(false)}
                                        disabled={utrNumber.length !== 12}
                                        className={`w-full py-3 rounded-lg font-bold transition ${utrNumber.length === 12
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {utrNumber.length === 12 ? '✓ Confirm UTR' : 'Enter 12-digit UTR'}
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Order Summary */}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h2 className="text-sm font-bold text-gray-900 uppercase mb-4">Order Summary</h2>
                        <div className="space-y-2 mb-4">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                                    <div className="flex flex-col">
                                        <span className="text-gray-800 font-medium">{item.name}</span>
                                        <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                                        <div className="flex gap-2 text-[10px] text-gray-400 mt-0.5">
                                            {item.puffCount && <span>{item.puffCount} Puffs</span>}
                                            {item.capacity && <span>{item.capacity}</span>}
                                            {item.resistance && <span>{item.resistance}</span>}
                                            {item.selectedFlavour && <span className="text-blue-500 font-bold uppercase">Flavour: {item.selectedFlavour}</span>}
                                            {item.selectedNicotine && <span className="text-blue-500 font-bold uppercase">Nicotine: {item.selectedNicotine}</span>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                                        {item.originalPrice && item.originalPrice > item.price && (
                                            <span className="text-xs text-gray-400 line-through">
                                                ₹{(item.originalPrice * item.quantity).toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-2 space-y-1">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-bold text-gray-900">₹{subtotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Delivery Charge</span>
                                <span className="font-bold text-gray-900">₹{DELIVERY_CHARGE.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t mt-2">
                                <span className="text-base font-bold text-gray-900">Total</span>
                                <span className="text-xl font-bold text-red-500">₹{(subtotal() + DELIVERY_CHARGE).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full font-bold uppercase py-4 rounded shadow-lg disabled:opacity-50 ${paymentMethod === 'PREPAID'
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                    >
                        {loading ? 'Processing...' : paymentMethod === 'PREPAID' ? 'Submit Order for Verification' : 'Confirm Order'}
                    </button>
                </form>
            </div >
        </div >
    );
}

