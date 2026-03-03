import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password || !name) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        await dbConnect();

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "Email already in use" }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user natively
        await User.create({
            email,
            name,
            password: hashedPassword,
        });

        return NextResponse.json({ success: true, message: "Account created successfully" });
    } catch (error) {
        console.error("Signup Error:", error);
        return NextResponse.json({ error: "An error occurred during sign up" }, { status: 500 });
    }
}
