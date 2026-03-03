import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        // Find user by token and ensure token is not expired
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: new Date() }
        });

        if (!user) {
            return NextResponse.json({ error: "Password reset token is invalid or has expired" }, { status: 400 });
        }

        // Hash new password
        user.password = await bcrypt.hash(password, 10);

        // Invalidate token
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        // Invalidate active sessions since password changed
        user.sessionVersion += 1;

        await user.save();

        return NextResponse.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}
