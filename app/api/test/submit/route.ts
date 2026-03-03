import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const RANKS = [
    { name: "Bronze", min: 0 },
    { name: "Silver", min: 1000 },
    { name: "Gold", min: 3000 },
    { name: "Platinum", min: 5000 },
    { name: "Diamond", min: 7000 },
    { name: "Master", min: 8500 },
    { name: "Grandmaster", min: 9500 },
];

function calculateRank(xp: number): string {
    let currentRank = "Bronze";
    for (const rank of RANKS) {
        if (xp >= rank.min) {
            currentRank = rank.name;
        }
    }
    return currentRank;
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { xpChange } = await req.json();

        if (typeof xpChange !== "number") {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        await dbConnect();

        const userId = session.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Update XP (ensure it doesn't go below 0)
        user.xp = Math.max(0, user.xp + xpChange);
        user.matchesPlayed += 1;

        // Recalculate Rank
        const newRank = calculateRank(user.xp);
        const rankChanged = user.rank !== newRank;

        user.rank = newRank;

        await user.save();

        return NextResponse.json({
            success: true,
            newXp: user.xp,
            newRank: user.rank,
            rankChanged,
        });
    } catch (error: unknown) {
        console.error("Error submitting test result:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
