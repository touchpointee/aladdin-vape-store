"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function FloatingWhatsApp() {
    const [waNumber, setWaNumber] = useState("");

    useEffect(() => {
        fetch('/api/admin/settings?key=whatsapp_number')
            .then(res => res.json())
            .then(data => { if (data.value) setWaNumber(data.value); })
            .catch(err => console.error(err));
    }, []);

    const handleClick = () => {
        const url = waNumber ? `https://wa.me/${waNumber}` : 'https://wa.me/';
        window.open(url, '_blank');
    };

    return (
        <button
            onClick={handleClick}
            className="fixed z-50 bg-green-500 text-white p-3 md:p-4 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 hover:scale-110 flex items-center justify-center
            bottom-[80px] right-4 md:bottom-8 md:right-8"
            aria-label="Contact on WhatsApp"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 md:w-8 md:h-8">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
        </button>
    );
}
