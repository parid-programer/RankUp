import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import qrcode from "qrcode";
import speakeasy from "speakeasy";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Generate a new TOTP secret
        const secretConfig = speakeasy.generateSecret({
            name: `RankUp (${user.email})`
        });

        const secret = secretConfig.base32;
        const otpauth = secretConfig.otpauth_url || ""; // Provides standard otpauth:// URL

        // Generate a QR code base64 image URL to send to the frontend
        const qrCodeUrl = await qrcode.toDataURL(otpauth);

        return NextResponse.json({ secret, qrCodeUrl });
    } catch (error) {
        console.error("2FA Generate Error:", error);
        return NextResponse.json({ error: "Failed to generate 2FA" }, { status: 500 });
    }
}
