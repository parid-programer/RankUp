import dbConnect from "@/lib/mongodb";
import QuestionRecord from "@/models/QuestionRecord";
import { notFound } from "next/navigation";
import CommentSection from "@/components/CommentSection";
import { format } from "date-fns";

export default async function ArchivedQuestionPage({ params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const resolvedParams = await params;

    let question;
    try {
        question = await QuestionRecord.findById(resolvedParams.id).lean();
    } catch {
        return notFound();
    }

    if (!question) return notFound();

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8 border-b border-base-content/10 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-secondary drop-shadow-sm">Theoretical Archive</h1>
                    <p className="text-base-content/60 font-bold tracking-wide uppercase text-sm mt-1">Archived Record • {format(new Date(question.activeDate!), "MMMM do, yyyy")}</p>
                </div>
            </div>

            <div className="glass-card p-8 rounded-3xl relative overflow-hidden mb-12 shadow-xl border border-secondary/20">
                <div className="absolute top-0 right-0 w-64 h-64 blur-[80px] -z-10 rounded-full bg-secondary/10"></div>

                <span className="badge badge-error badge-lg font-bold shadow-sm mb-6">Historical Difficulty: {question.difficulty}/10</span>
                <h2 className="text-2xl font-bold mb-8 leading-relaxed break-words">{question.text}</h2>

                <div className="flex flex-col gap-4 mb-8">
                    {question.options.map((opt: string, idx: number) => {
                        const isCorrectAnswer = question.correctAnswerIndex === idx;
                        let btnClass = "btn btn-lg justify-start h-auto min-h-16 py-4 px-6 text-left whitespace-normal normal-case font-medium ";

                        if (isCorrectAnswer) btnClass += "btn-success text-success-content border-success outline outline-2 outline-success/40 scale-[1.01] pointer-events-none";
                        else btnClass += "btn-outline opacity-40 grayscale pointer-events-none";

                        return (
                            <button key={idx} className={btnClass} disabled>
                                <span className="mr-4 opacity-70 font-black tracking-widest">{String.fromCharCode(65 + idx)}.</span>
                                {opt}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-8 bg-base-200/50 p-6 rounded-2xl border border-base-content/10">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Official System Explanation
                    </h3>
                    <p className="text-base-content/80 leading-relaxed font-medium">{question.explanation}</p>
                </div>
            </div>

            {/* Recursively bind to this historical ID */}
            <CommentSection targetType="question" targetId={question._id.toString()} />
        </div>
    );
}
