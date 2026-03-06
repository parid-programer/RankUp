import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "missing-api-key",
});

const questionSchema = z.object({
    question: z.string(),
    options: z.array(z.string()),
    correctAnswerIndex: z.number(),
    explanation: z.string(),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            //      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { difficulty, subject } = await req.json();

        if (!difficulty || difficulty < 1 || difficulty > 10) {
            return NextResponse.json(
                { error: "Invalid difficulty level (must be 1-10)" },
                { status: 400 }
            );
        }

        const targetSubject = subject && subject !== "General" ? subject : "General Knowledge";

        const response = await openai.responses.parse({
            model: "gpt-5-nano", // or the required model
            input: [
                {
                    role: "system",
                    content: `You are a strict, highly intelligent quiz master generating multiple-choice questions for a competitive gamified platform. 
The user is currently at difficulty level ${difficulty} out of 10. 
The required subject for this question is: ${targetSubject}.
Generate a ${targetSubject} question appropriate for this difficulty. 
Level 1 should be fundamental. Level 10 should be highly specific, expert-level trivia or complex problem-solving.

Respond ONLY with a valid JSON object matching this schema:
{
"question": "The question text",
"options": ["Option A", "Option B", "Option C", "Option D"],
"correctAnswerIndex": <0-3>,
"explanation": "Brief explanation of why the answer is correct."
}`,
                },
            ],
            text: {
                format: zodTextFormat(questionSchema, "question"), 
                "verbosity": "medium"
            },
            reasoning:{
                "effort": "minimal"
            },
    });
        const questionData = response.output_parsed;

        return NextResponse.json(questionData);
    } catch (error: unknown) {
        console.error("Error generating question:", error);
        return NextResponse.json(
            { error: "Failed to generate question" },
            { status: 500 }
        );
    }
}
