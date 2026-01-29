"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
    const router = useRouter();
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuthStore();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length < 10) return alert("Enter valid phone");

        setLoading(true);

        // Direct Login
        setTimeout(() => {
            login(phone);
            setLoading(false);
            router.push("/account");
        }, 800);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col p-6">
            <Link href="/" className="mb-8 self-start">
                <ArrowLeft size={24} className="text-gray-600" />
            </Link>

            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome Back
                </h1>
                <p className="text-gray-500 mb-8 text-sm">
                    Enter your mobile number to login or signup.
                </p>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
                        {loading ? "Please wait..." : "Continue"}
                    </button>
                </form>
            </div>

            <p className="text-center text-xs text-gray-400 mt-auto">
                By continuing, you agree to our Terms & Privacy Policy.
            </p>
        </div>
    );
}
