import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import speakeasy from "speakeasy";

export async function POST(req: Request) {
    try {
        const { token, secret } = await req.json();
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!token || !secret) {
            return NextResponse.json({ error: "Missing token or secret" }, { status: 400 });
        }

        const isValid = speakeasy.totp.verify({
            secret,
            encoding: "base32",
            token,
            window: 1 // Allow 1 step before/after (30 seconds leeway)
        });

        if (!isValid) {
            return NextResponse.json({ error: "Invalid authenticator code" }, { status: 400 });
        }

        await dbConnect();
        await User.findByIdAndUpdate(session.user.id, {
            twoFactorEnabled: true,
            twoFactorSecret: secret,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("2FA Verification Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
