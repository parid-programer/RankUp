import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "missing-api-key",
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            //      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { difficulty } = await req.json();

        if (!difficulty || difficulty < 1 || difficulty > 10) {
            return NextResponse.json(
                { error: "Invalid difficulty level (must be 1-10)" },
                { status: 400 }
            );
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // or the required model
            messages: [
                {
                    role: "system",
                    content: `You are a strict, highly intelligent quiz master generating multiple-choice questions for a competitive gamified platform. 
          The user is currently at difficulty level ${difficulty} out of 10. 
          Generate a question appropriate for this difficulty. 
          Level 1 should be fundamental general knowledge. Level 10 should be highly specific, expert-level trivia or complex problem-solving.
          
          Respond ONLY with a valid JSON object matching this schema:
          {
            "question": "The question text",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswerIndex": <0-3>,
            "explanation": "Brief explanation of why the answer is correct."
          }`,
                },
            ],
            response_format: { type: "json_object" },
        });

        const resultText = completion.choices[0].message.content;
        if (!resultText) throw new Error("No response from OpenAI");

        const questionData = JSON.parse(resultText);

        return NextResponse.json(questionData);
    } catch (error: unknown) {
        console.error("Error generating question:", error);
        return NextResponse.json(
            { error: "Failed to generate question" },
            { status: 500 }
        );
    }
}
