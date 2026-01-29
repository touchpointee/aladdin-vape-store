"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AgeVerification() {
    const [isVerified, setIsVerified] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const checkVerification = () => {
            const stored = localStorage.getItem("age_verified_timestamp");
            if (stored) {
                const timestamp = parseInt(stored, 10);
                const now = Date.now();
                const twentyFourHours = 24 * 60 * 60 * 1000;

                if (now - timestamp < twentyFourHours) {
                    setIsVerified(true);
                } else {
                    localStorage.removeItem("age_verified_timestamp");
                }
            }
            setMounted(true);
        };

        checkVerification();
    }, []);

    const handleVerifyNodes = () => {
        const now = Date.now();
        localStorage.setItem("age_verified_timestamp", now.toString());
        setIsVerified(true);
    };

    const handleExit = () => {
        window.location.href = "https://www.google.com";
    };

    if (!mounted) return null;
    if (isVerified || pathname?.startsWith('/admin')) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4 backdrop-blur-[2px]">
            <div className="bg-white rounded shadow-2xl max-w-[400px] w-full p-8 text-center animate-in fade-in zoom-in duration-300">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 uppercase tracking-[0.05em] leading-tight">
                    Are you over 18 years of age?
                </h2>

                <div className="w-20 h-[1px] bg-gray-400 mx-auto mb-6"></div>

                <p className="text-gray-700 text-[15px] mb-8 leading-relaxed max-w-[300px] mx-auto">
                    The content of this website cannot be shown unless you verify your age. Please verify that you are over 18 to see this page
                </p>

                <div className="flex flex-col gap-3 max-w-[240px] mx-auto">
                    <button
                        onClick={handleVerifyNodes}
                        className="bg-white border-[1px] border-[#0099ff] text-[#0099ff] font-bold py-2.5 px-4 transition-colors w-full uppercase text-sm tracking-wide"
                    >
                        I'm Over 18
                    </button>
                    <button
                        onClick={handleExit}
                        className="bg-[#0099ff] border-[1px] border-[#0099ff] text-white font-bold py-2.5 px-4 hover:bg-[#0088ee] transition-colors w-full uppercase text-sm tracking-wide"
                    >
                        Exit
                    </button>
                </div>
            </div>
        </div>
    );
}
