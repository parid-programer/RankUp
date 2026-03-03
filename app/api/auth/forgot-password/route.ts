import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        await dbConnect();
        const user = await User.findOne({ email });

        if (!user) {
            // Return success even if user not found to prevent email enumeration
            return NextResponse.json({ success: true });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        // Send email
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nodemailer = require("nodemailer");
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.ethereal.email",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            }
        });

        // Use NextRequest parsed URL info natively
        const { origin } = new URL(req.url);
        const resetUrl = `${origin}/auth/reset-password?token=${resetToken}`;

        await transporter.sendMail({
            from: process.env.SMTP_USER || '"RankUp Platform" <noreply@rankup.com>',
            to: user.email,
            subject: "Password Reset Request",
            text: `You requested a password reset. Please go to this link to reset your password: ${resetUrl}`,
            html: `<p>You requested a password reset.</p><p>Click <a href="${resetUrl}">here</a> to reset your password.</p><p>This link will expire in 1 hour.</p>`
        }).catch(console.error);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}
