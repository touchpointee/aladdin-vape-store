import Link from "next/link";
import { ArrowLeft, MessageCircle, Phone, Mail, ChevronDown } from "lucide-react";
import connectDB from "@/lib/db";
import { Settings } from "@/models/unified";

async function getWaNumber() {
    try {
        await connectDB();
        const setting = await Settings.findOne({ key: 'whatsapp_number' });
        return setting?.value || '';
    } catch (e) {
        return '';
    }
}

export default async function HelpPage() {
    const waNumber = await getWaNumber();
    const waLink = waNumber ? `https://wa.me/${waNumber}` : 'https://wa.me/';

    return (
        <div className="bg-gray-50 min-h-screen pb-safe">
            <div className="bg-white p-4 flex items-center gap-4 border-b sticky top-0 z-10">
                <Link href="/account">
                    <ArrowLeft size={24} className="text-gray-600" />
                </Link>
                <h1 className="text-lg font-bold text-gray-900">Help &amp; Support</h1>
            </div>

            <div className="p-4 space-y-6">

                {/* Contact Options */}
                <div className="grid grid-cols-2 gap-4">
                    <a href={waLink} target="_blank" className="bg-green-500 text-white p-4 rounded-xl flex flex-col items-center gap-2 shadow-sm hover:bg-green-600 transition">
                        <MessageCircle size={24} />
                        <span className="text-sm font-bold">WhatsApp</span>
                    </a>
                    <button className="bg-blue-500 text-white p-4 rounded-xl flex flex-col items-center gap-2 shadow-sm hover:bg-blue-600 transition">
                        <Phone size={24} />
                        <span className="text-sm font-bold">Call Us</span>
                    </button>
                    <button className="bg-white text-gray-800 p-4 rounded-xl flex flex-col items-center gap-2 shadow-sm border border-gray-100 col-span-2">
                        <Mail size={24} className="text-gray-400" />
                        <span className="text-sm font-bold">support@mrvape.com</span>
                    </button>
                </div>

                {/* FAQs */}
                <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Frequently Asked Questions</h3>
                    <div className="space-y-3">
                        {[
                            { q: "How do I return an item?", a: "Returns are accepted within 7 days of delivery if the item is unused and sealed." },
                            { q: "Where is my order?", a: "You can track your order status in the 'My Orders' section." },
                            { q: "Do you ship internationally?", a: "Currently, we only ship within India." },
                            { q: "Is Cash on Delivery available?", a: "Yes, we support COD for all orders." }
                        ].map((faq, i) => (
                            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <h4 className="font-bold text-sm text-gray-900 mb-2 flex justify-between">
                                    {faq.q}
                                    <ChevronDown size={16} className="text-gray-400" />
                                </h4>
                                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
