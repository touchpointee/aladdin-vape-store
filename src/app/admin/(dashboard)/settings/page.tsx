"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Settings, Bell, Image as ImageIcon, MessageSquare, QrCode, Volume2, Save, CreditCard } from "lucide-react";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Unified state for both banners
    const [banners, setBanners] = useState({
        banner1: { image: '', link: '', title: '', subtitle: '', badge: '' },
        banner2: { image: '', link: '', title: '', subtitle: '', badge: '' },
    });

    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [siteLogo, setSiteLogo] = useState('/logo.jpg');
    const [paymentQrCode, setPaymentQrCode] = useState('');
    const [notificationSoundEnabled, setNotificationSoundEnabled] = useState(true);
    const [notificationSoundUrl, setNotificationSoundUrl] = useState('https://assets.mixkit.co/active_storage/sfx/1013/1013-preview.mp3');
    const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(true);

    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        banner1: null,
        banner2: null,
        siteLogo: null,
        paymentQrCode: null
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            if (res.ok) {
                if (data.banner1) {
                    setBanners({
                        banner1: { ...banners.banner1, ...data.banner1 },
                        banner2: { ...banners.banner2, ...data.banner2 },
                    });
                }
                if (data.whatsapp_number) {
                    setWhatsappNumber(data.whatsapp_number);
                }
                if (data.site_logo) {
                    setSiteLogo(data.site_logo);
                }
                if (data.payment_qr_code) {
                    setPaymentQrCode(data.payment_qr_code);
                }
                if (data.notification_sound_enabled !== undefined) {
                    setNotificationSoundEnabled(data.notification_sound_enabled);
                }
                if (data.notification_sound_url) {
                    setNotificationSoundUrl(data.notification_sound_url);
                }
                if (data.online_payment_enabled !== undefined) {
                    setOnlinePaymentEnabled(data.online_payment_enabled);
                }
            }
        } catch (error) {
            console.error('Failed to load settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        if (e.target.files && e.target.files[0]) {
            setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
        }
    };

    const handleTextChange = (key: 'banner1' | 'banner2', field: string, value: string) => {
        setBanners(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const formData = new FormData();

        // Append General Settings
        formData.append('whatsapp_number', whatsappNumber);
        if (files.siteLogo) formData.append('site_logo', files.siteLogo);
        if (files.paymentQrCode) formData.append('payment_qr_code', files.paymentQrCode);
        formData.append('notification_sound_enabled', String(notificationSoundEnabled));
        formData.append('notification_sound_url', notificationSoundUrl);
        formData.append('online_payment_enabled', String(onlinePaymentEnabled));

        // Append Banner 1
        if (files.banner1) formData.append('banner1_image', files.banner1);
        formData.append('banner1_link', banners.banner1.link);
        formData.append('banner1_title', banners.banner1.title);
        formData.append('banner1_subtitle', banners.banner1.subtitle);
        formData.append('banner1_badge', banners.banner1.badge);

        // Append Banner 2
        if (files.banner2) formData.append('banner2_image', files.banner2);
        formData.append('banner2_link', banners.banner2.link);
        formData.append('banner2_title', banners.banner2.title);
        formData.append('banner2_subtitle', banners.banner2.subtitle);
        formData.append('banner2_badge', banners.banner2.badge);

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                alert('Settings Updated Successfully!');
                fetchSettings(); // Refresh list to get consistent state
                setFiles({ banner1: null, banner2: null, siteLogo: null, paymentQrCode: null });
            } else {
                alert('Failed to update settings');
            }
        } catch (error) {
            alert('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    const renderBannerForm = (key: 'banner1' | 'banner2', label: string) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <h3 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-2">
                <ImageIcon size={18} className="text-blue-500" />
                {label}
            </h3>

            <div className="grid grid-cols-1 gap-4">
                {/* Image Preview */}
                <div className="mb-2">
                    <p className="block text-sm font-medium mb-1 text-gray-600">Current Image</p>
                    {files[key] ? (
                        <div className="relative w-full h-48 rounded bg-gray-100 flex items-center justify-center border border-dashed border-blue-300">
                            <span className="text-blue-500 font-medium">{files[key]?.name}</span>
                        </div>
                    ) : banners[key].image ? (
                        <div className="relative w-full h-48 rounded overflow-hidden border">
                            <Image src={banners[key].image} alt="Banner" fill className="object-cover" unoptimized />
                        </div>
                    ) : (
                        <div className="w-full h-48 bg-gray-50 rounded border flex items-center justify-center text-gray-400">
                            No Image
                        </div>
                    )}
                </div>

                {/* File Input */}
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Upload New Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, key)}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>

                {/* Text Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Badge Text (Small)</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. New Arrivals"
                            value={banners[key].badge}
                            onChange={(e) => handleTextChange(key, 'badge', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Main Title (Large)</label>
                        <textarea
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none h-[42px]"
                            placeholder="e.g. Disposable Vapes"
                            value={banners[key].title}
                            onChange={(e) => handleTextChange(key, 'title', e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1 text-gray-700">Link URL</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. /products?category=disposables"
                            value={banners[key].link}
                            onChange={(e) => handleTextChange(key, 'link', e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex items-center gap-3 mb-8">
                <Settings className="text-blue-600" size={32} />
                <h1 className="text-3xl font-extrabold text-gray-900">Settings</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">

                {/* General Settings Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                        <Settings size={20} className="text-gray-500" />
                        <h2 className="text-lg font-bold text-gray-800">General Settings</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                                    <MessageSquare size={16} className="text-blue-500" />
                                    WhatsApp Number
                                </label>
                                <input
                                    type="text"
                                    className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="e.g. 971501234567"
                                    value={whatsappNumber}
                                    onChange={(e) => setWhatsappNumber(e.target.value)}
                                />
                                <p className="text-[11px] text-gray-400 mt-2 ml-1">Include country code, no + or spaces.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                                    <ImageIcon size={16} className="text-blue-500" />
                                    Site Logo
                                </label>
                                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="relative w-12 h-12 bg-white rounded-lg border flex-shrink-0 shadow-sm">
                                        <Image
                                            src={files.siteLogo ? URL.createObjectURL(files.siteLogo) : siteLogo}
                                            alt="Logo Preview"
                                            fill
                                            className="object-contain p-1"
                                            unoptimized
                                        />
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'siteLogo')}
                                        className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment QR Code Section */}
                        <div className="mt-10 pt-8 border-t border-gray-100">
                            <div className="flex items-center gap-2 mb-6">
                                <QrCode size={20} className="text-gray-500" />
                                <h3 className="text-lg font-bold text-gray-800">Payment QR Code</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-600">Current QR Code</label>
                                    <div className="relative w-full aspect-square max-w-[200px] bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm group">
                                        {files.paymentQrCode ? (
                                            <Image
                                                src={URL.createObjectURL(files.paymentQrCode)}
                                                alt="QR Preview"
                                                fill
                                                className="object-contain p-4"
                                            />
                                        ) : paymentQrCode ? (
                                            <Image
                                                src={paymentQrCode}
                                                alt="Payment QR Code"
                                                fill
                                                className="object-contain p-4"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                                                <QrCode size={40} strokeWidth={1} />
                                                <span className="text-xs">No QR uploaded</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <label className="block text-sm font-semibold mb-3 text-gray-700">Update QR Code</label>
                                    <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'paymentQrCode')}
                                            className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-green-600 file:text-white hover:file:bg-green-700 cursor-pointer"
                                        />
                                        <p className="text-[11px] text-green-700/70 mt-3 leading-relaxed font-medium">
                                            Upload your UPI QR code (PhonePe, GPay, etc.) for customers to use during checkout.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notification Settings Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell size={20} className="text-gray-500" />
                            <h2 className="text-lg font-bold text-gray-800">New Order Notifications</h2>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notificationSoundEnabled}
                                onChange={(e) => setNotificationSoundEnabled(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-bold text-gray-700">{notificationSoundEnabled ? 'ON' : 'OFF'}</span>
                        </label>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className={!notificationSoundEnabled ? 'opacity-50 pointer-events-none' : ''}>
                                <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                                    <Volume2 size={16} className="text-blue-500" />
                                    Choose Alert Sound
                                </label>
                                <select
                                    value={notificationSoundUrl}
                                    onChange={(e) => {
                                        setNotificationSoundUrl(e.target.value);
                                        const audio = new Audio(e.target.value);
                                        audio.play().catch(console.error);
                                    }}
                                    className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat"
                                >
                                    <option value="https://assets.mixkit.co/active_storage/sfx/1013/1013-preview.mp3">Digital Beep (Default)</option>
                                    <option value="https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3">💰 Cash Register (Cha-ching!)</option>
                                    <option value="https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3">Classic Bell</option>
                                    <option value="https://assets.mixkit.co/active_storage/sfx/941/941-preview.mp3">Ding Dong</option>
                                    <option value="https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3">Success Chime</option>
                                    <option value="https://assets.mixkit.co/active_storage/sfx/131/131-preview.mp3">Electric Beep</option>
                                    <option value="https://assets.mixkit.co/active_storage/sfx/2561/2561-preview.mp3">🚨 EMERGENCY SIREN 1 (LOUD)</option>
                                    <option value="https://assets.mixkit.co/active_storage/sfx/2190/2190-preview.mp3">🚓 POLICE SIREN (LOUD)</option>
                                    <option value="https://assets.mixkit.co/active_storage/sfx/1004/1004-preview.mp3">🔔 SHIP BELL (FOR ORDERS)</option>
                                </select>
                                <p className="text-[11px] text-gray-400 mt-2 leading-tight">
                                    Alert will play for every new order arriving while you're on the dashboard.
                                </p>
                            </div>

                            <div className="flex flex-col items-center justify-center bg-blue-50/50 rounded-2xl p-6 border border-blue-100 border-dashed">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const audio = new Audio(notificationSoundUrl);
                                        audio.play().catch(console.error);
                                    }}
                                    className="flex items-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-full font-bold shadow-sm hover:shadow-md transition-all transform hover:scale-105 active:scale-95 border border-blue-100"
                                >
                                    <Volume2 size={18} />
                                    Test Alert Sound
                                </button>
                                <p className="text-[10px] text-blue-600/60 mt-3 font-semibold uppercase tracking-wider">Sound Preview</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Online Payment Settings Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CreditCard size={20} className="text-gray-500" />
                            <h2 className="text-lg font-bold text-gray-800">Checkout Options</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-between bg-blue-50/50 p-6 rounded-2xl border border-blue-100 border-dashed">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <CreditCard size={18} className="text-blue-600" />
                                    Enable Online Payment (UPI)
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 max-w-sm">
                                    When ON, customers can choose to pay via UPI by scanning your QR code. When OFF, only COD will be available.
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={onlinePaymentEnabled}
                                    onChange={(e) => setOnlinePaymentEnabled(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                                <span className="ml-3 text-sm font-bold text-gray-700 w-8">{onlinePaymentEnabled ? 'ON' : 'OFF'}</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Banner Settings Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 px-2">
                        <ImageIcon size={24} className="text-gray-500" />
                        <h2 className="text-2xl font-bold text-gray-900">Front Page Banners</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {renderBannerForm('banner1', 'Left Main Banner')}
                        {renderBannerForm('banner2', 'Right Main Banner')}
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <button
                        type="submit"
                        disabled={saving}
                        className={`flex items-center gap-2 px-10 py-4 rounded-2xl font-bold text-white shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}`}
                    >
                        {saving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Save All Settings
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );

}
