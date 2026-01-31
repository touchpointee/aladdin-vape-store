import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {
    try {
        const { phone, otp } = await req.json();

        // Hardcoded Credentials
        const ADMIN_PHONE = "9999999999";
        const ADMIN_OTP = "1234";

        if (phone === ADMIN_PHONE && otp === ADMIN_OTP) {
            // Generate JWT
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-it');
            const alg = 'HS256';

            const token = await new SignJWT({ role: 'admin' })
                .setProtectedHeader({ alg })
                .setExpirationTime('100y') // Indefinite
                .sign(secret);

            // Set Cookie
            const response = NextResponse.json({ success: true, message: "Login successful" });
            response.cookies.set({
                name: 'admin_token',
                value: token,
                httpOnly: true,
                path: '/',
                maxAge: 60 * 60 * 24 * 365 * 100, // 100 years
            });

            return response;
        }

        return NextResponse.json({ error: "Invalid Credentials" }, { status: 401 });

    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
