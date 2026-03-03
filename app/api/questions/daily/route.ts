import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import QuestionRecord from "@/models/QuestionRecord";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/models/User";

// Uses OpenAI to generate a daily question for all players using a lazy-evaluation pattern
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "sk-fallback",
});

export async function GET() {
    try {
        await dbConnect();

        // Find today's date stripped to midnight UTC for synchronized global checking
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        let dailyQ = await QuestionRecord.findOne({ isDaily: true, activeDate: today });

        if (!dailyQ) {
            // Lazy load - The first user to hit the page generates the question for everybody else
            const prompt = `Generate an incredibly interesting, rare, and challenging multiple choice question for a gamified ranking platform's "Question of the Day". The topic should be something from Computer Science, Software Engineering, or Advanced Mathematics. Difficulty level should be around Master/Grandmaster level (8 to 10 out of 10). Return ONLY valid JSON with fields: { "text": string, "options": string[], "correctAnswerIndex": number, "explanation": string, "difficulty": number }`;

            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "system", content: prompt }],
                response_format: { type: "json_object" },
            });

            const raw = response.choices[0].message.content || "{}";
            const generated = JSON.parse(raw);

            dailyQ = await QuestionRecord.create({
                ...generated,
                isDaily: true,
                activeDate: today,
            });
        }

        const session = await getServerSession(authOptions);
        let hasAnswered = false;
        if (session?.user?.id) {
            const user = await User.findById(session.user.id).lean();
            if (user?.dailyQuestionsCompleted?.map((id: any) => id.toString()).includes(dailyQ._id.toString())) {
                hasAnswered = true;
            }
        }

        // If not answered, mask the correctAnswerIndex and explanation for integrity
        const responseData = dailyQ.toObject();
        if (!hasAnswered) {
            delete responseData.correctAnswerIndex;
            delete responseData.explanation;
        }

        return NextResponse.json({ question: responseData, hasAnswered });
    } catch (e) {
        console.error("Daily Generation Error", e);
        return NextResponse.json({ error: "Failed to fetch the Question of the Day" }, { status: 500 });
    }
}
