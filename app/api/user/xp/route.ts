import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const subject = searchParams.get("subject") || "General";

        await dbConnect();
        const user = await User.findById(session.user.id).lean();

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let xp = 0;
        if (subject === "General") {
            xp = user.xp || 0;
        } else {
            xp = user.subjects?.[subject]?.xp || 0;
        }

        return NextResponse.json({ xp });
    } catch (error) {
        console.error("Error fetching user subject xp:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
