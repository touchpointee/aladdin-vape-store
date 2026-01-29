"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Unified state for both banners
    const [banners, setBanners] = useState({
        banner1: { image: '', link: '', title: '', subtitle: '', badge: '' },
        banner2: { image: '', link: '', title: '', subtitle: '', badge: '' },
    });

    const [whatsappNumber, setWhatsappNumber] = useState('');

    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        banner1: null,
        banner2: null
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
                setFiles({ banner1: null, banner2: null });
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
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-gray-700">{label}</h3>

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
                            <Image src={banners[key].image} alt="Banner" fill className="object-cover" />
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
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-8 text-gray-800">Settings</h1>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* General Settings Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">General Settings</h2>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">WhatsApp Number</label>
                        <input
                            type="text"
                            className="w-full max-w-md border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. 971501234567"
                            value={whatsappNumber}
                            onChange={(e) => setWhatsappNumber(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter number with country code, without '+' or spaces.</p>
                    </div>
                </div>

                <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Front Page Banners</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {renderBannerForm('banner1', 'Left Banner')}
                    {renderBannerForm('banner2', 'Right Banner')}
                </div>

                <div className="flex justify-end pt-4 pb-12">
                    <button
                        type="submit"
                        disabled={saving}
                        className={`px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all transform hover:scale-105 ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {saving ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
