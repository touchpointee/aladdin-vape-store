"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
    const router = useRouter();
    const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length < 10) return alert("Enter valid phone");

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setStep('OTP');
            setLoading(false);
        }, 1000);
    };

    const { login } = useAuthStore();

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Mock verification - Accept any OTP
        setTimeout(() => {
            login(phone); // Store user in local state
            setLoading(false);
            router.push("/account"); // Redirect to account page
        }, 800);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col p-6">
            <Link href="/" className="mb-8 self-start">
                <ArrowLeft size={24} className="text-gray-600" />
            </Link>

            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {step === 'PHONE' ? "Welcome Back" : "Verify OTP"}
                </h1>
                <p className="text-gray-500 mb-8 text-sm">
                    {step === 'PHONE'
                        ? "Enter your mobile number to login or signup."
                        : `We sent a code to +91 ${phone}`}
                </p>

                {step === 'PHONE' ? (
                    <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                        <div className="flex items-center border rounded-lg px-3 py-3 bg-gray-50 focus-within:ring-2 ring-blue-500 ring-offset-1">
                            <span className="text-gray-500 font-bold border-r pr-3 mr-3">+91</span>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                placeholder="Mobile Number"
                                className="bg-transparent border-none outline-none w-full font-medium text-gray-900 placeholder:text-gray-400"
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || phone.length < 10}
                            className="bg-blue-600 text-white font-bold py-4 rounded-lg uppercase tracking-wide disabled:opacity-50 hover:bg-blue-700 transition active:scale-[0.99]"
                        >
                            {loading ? "Sending..." : "Continue"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 4-digit OTP"
                            className="text-center text-2xl tracking-[0.5em] font-bold border-2 rounded-lg px-3 py-4 bg-gray-50 focus:border-blue-500 outline-none w-full"
                            maxLength={4}
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={loading || otp.length < 4}
                            className="bg-blue-600 text-white font-bold py-4 rounded-lg uppercase tracking-wide disabled:opacity-50 hover:bg-blue-700 transition active:scale-[0.99]"
                        >
                            {loading ? "Verifying..." : "Verify & Login"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep('PHONE')}
                            className="text-blue-600 text-sm font-semibold mt-2"
                        >
                            Change Number?
                        </button>
                    </form>
                )}
            </div>

            <p className="text-center text-xs text-gray-400 mt-auto">
                By continuing, you agree to our Terms & Privacy Policy.
            </p>
        </div>
    );
}
