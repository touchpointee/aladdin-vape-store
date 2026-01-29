"use client";

import { useState, useEffect } from "react";

export default function AgeVerification() {
    const [isVerified, setIsVerified] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // We do NOT check localStorage/sessionStorage as requested ("ask in each visit")
        // Just reliance on React state which resets on refresh
    }, []);

    const handleExit = () => {
        // Redirect away or close window
        window.location.href = "https://www.google.com";
    };

    if (!mounted) return null; // Avoid hydration mismatch
    if (isVerified) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-8 text-center animate-in fade-in zoom-in duration-300">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 uppercase tracking-wider">
                    Are you over 18 years of age?
                </h2>

                <div className="w-24 h-1 bg-black mx-auto mb-6"></div>

                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                    The content of this website cannot be shown unless you verify your age. Please verify that you are over 18 to see this page.
                </p>

                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <button
                        onClick={() => setIsVerified(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-md transition-colors w-full md:w-auto uppercase tracking-wide"
                    >
                        I'm Over 18
                    </button>
                    <button
                        onClick={handleExit}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 px-8 rounded-md transition-colors w-full md:w-auto uppercase tracking-wide"
                    >
                        Exit
                    </button>
                </div>
            </div>
        </div>
    );
}
