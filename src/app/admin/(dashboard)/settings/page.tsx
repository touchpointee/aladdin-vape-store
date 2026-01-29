"use client";

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings?key=whatsapp_number');
            const data = await res.json();
            if (data.value) setWhatsappNumber(data.value);
        } catch (error) {
            console.error("Failed to fetch settings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'whatsapp_number', value: whatsappNumber }),
            });

            if (res.ok) {
                setMessage("Settings saved successfully!");
                setTimeout(() => setMessage(""), 3000);
            } else {
                setMessage("Failed to save.");
            }
        } catch (error) {
            setMessage("Error saving settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Store Settings</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            WhatsApp Number (with country code)
                        </label>
                        <p className="text-xs text-gray-500 mb-2">Example: 919876543210 (No + or spaces)</p>
                        <input
                            type="text"
                            value={whatsappNumber}
                            onChange={(e) => setWhatsappNumber(e.target.value)}
                            placeholder="919999999999"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        {message && (
                            <span className={`text-sm ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
                                {message}
                            </span>
                        )}
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Save Settings
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
