import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        const { name, email, message } = await req.json();

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: "Name, email, and message are required" },
                { status: 400 }
            );
        }

        // Configure your actual SMTP credentials in .env.local
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.example.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: `"${name}" <${email}>`, // Sender address
            to: process.env.ADMIN_EMAIL || "admin@rankup.com", // List of receivers
            subject: `New Contact Form Submission from ${name}`, // Subject line
            text: `You have received a new message from ${name} (${email}):\n\n${message}`, // Plain text body
            html: `<p>You have received a new message from <strong>${name}</strong> (${email}):</p><p>${message}</p>`, // HTML body
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Error sending email:", error);
        // If SMTP is not configured, we still want to gracefully fail for the demo
        return NextResponse.json(
            { error: "Failed to send email. Check SMTP configuration." },
            { status: 500 }
        );
    }
}
