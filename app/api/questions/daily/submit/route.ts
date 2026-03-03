import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import QuestionRecord from "@/models/QuestionRecord";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { questionId, selectedIndex } = await req.json();

        if (!questionId || selectedIndex === undefined) {
            return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findById(session.user.id);
        const question = await QuestionRecord.findById(questionId);

        if (!user || !question) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // Gamification Constraint - Single submission architecture
        if (user.dailyQuestionsCompleted.includes(questionId)) {
            return NextResponse.json({ error: "Question already answered" }, { status: 400 });
        }

        const isCorrect = question.correctAnswerIndex === selectedIndex;
        let pointsEarned = 0;

        // Base the gamification XP yield heavily off the raw difficulty of the Daily Question
        if (isCorrect) {
            pointsEarned = question.difficulty * 12; // High-yield multiplier for global daily events
        } else {
            pointsEarned = 5; // Static participation XP since daily's are very hard
        }

        user.xp += pointsEarned;
        user.matchesPlayed += 1;
        user.dailyQuestionsCompleted.push(questionId);

        const rankThresholds = [
            { name: "Grandmaster", xp: 10000 },
            { name: "Master", xp: 5000 },
            { name: "Diamond", xp: 2500 },
            { name: "Platinum", xp: 1000 },
            { name: "Gold", xp: 500 },
            { name: "Silver", xp: 100 },
            { name: "Bronze", xp: 0 },
        ];
        user.rank = rankThresholds.find(t => user.xp >= t.xp)?.name || "Bronze";

        await user.save();

        return NextResponse.json({
            success: true,
            isCorrect,
            pointsEarned,
            newXp: user.xp,
            newRank: user.rank
        });

    } catch (e) {
        console.error("Daily Submit Error", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
