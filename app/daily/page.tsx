"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import CommentSection from "@/components/CommentSection";
import { format } from "date-fns";

export default function DailyQuestionPage() {
    const { status } = useSession();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [question, setQuestion] = useState<any>(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        fetch("/api/questions/daily")
            .then(res => res.json())
            .then(data => {
                if (data.question) {
                    setQuestion(data.question);
                    setHasAnswered(data.hasAnswered);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSubmit = async () => {
        if (selectedOption === null) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/questions/daily/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ questionId: question._id, selectedIndex: selectedOption })
            });
            const data = await res.json();
            if (res.ok) {
                setResult(data);
                setHasAnswered(true);
                // Refetch instantly to lift obfuscations and fetch the explanation
                const updated = await fetch("/api/questions/daily").then(r => r.json());
                if (updated.question) setQuestion(updated.question);
            } else {
                alert(data.error || "Failed to submit answer.");
            }
        } catch {
            alert("Connection error during submission.");
        }
        setSubmitting(false);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

    if (!question) return <div className="min-h-screen flex items-center justify-center font-bold text-error">Failed to synchronize Daily Question. Please try again later.</div>;

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8 border-b border-base-content/10 pb-6">
                <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div>
                    <h1 className="text-3xl font-black">Question of the Day</h1>
                    <p className="text-base-content/60 font-bold tracking-wide uppercase text-sm mt-1">{format(new Date(), "MMMM do, yyyy")}</p>
                </div>
            </div>

            <div className={`glass-card p-8 rounded-3xl relative overflow-hidden mb-12 shadow-xl border ${hasAnswered ? 'border-success/30' : 'border-primary/20'}`}>
                {/* Background glow emitter */}
                <div className={`absolute top-0 right-0 w-64 h-64 blur-[80px] -z-10 rounded-full ${hasAnswered ? 'bg-success/10' : 'bg-primary/10'}`}></div>

                <div className="flex justify-between items-start mb-8">
                    <span className="badge badge-error badge-lg font-bold shadow-sm">Difficulty: {question.difficulty}/10</span>
                </div>

                <h2 className="text-2xl font-bold mb-10 leading-relaxed break-words">{question.text}</h2>

                <div className="flex flex-col gap-4 mb-8">
                    {question.options.map((opt: string, idx: number) => {
                        const isCorrectAnswer = hasAnswered && question.correctAnswerIndex === idx;
                        const isWrongSelection = hasAnswered && selectedOption === idx && !isCorrectAnswer;
                        const isSelected = selectedOption === idx;

                        let btnClass = "btn btn-lg justify-start h-auto min-h-16 py-4 px-6 text-left whitespace-normal normal-case font-medium ";

                        if (hasAnswered) {
                            if (isCorrectAnswer) btnClass += "btn-success text-success-content border-success";
                            else if (isWrongSelection) btnClass += "bg-error/20 text-error border-error border-2";
                            else btnClass += "btn-outline opacity-50";
                        } else {
                            if (isSelected) btnClass += "btn-primary shadow-lg scale-[1.01]";
                            else btnClass += "btn-outline hover:border-primary/50";
                        }

                        return (
                            <button
                                key={idx}
                                className={`transition-all duration-300 ${btnClass}`}
                                onClick={() => !hasAnswered && setSelectedOption(idx)}
                                disabled={hasAnswered}
                            >
                                <span className="mr-4 opacity-70 font-black tracking-widest">{String.fromCharCode(65 + idx)}.</span>
                                {opt}
                            </button>
                        );
                    })}
                </div>

                {!hasAnswered && (
                    <div className="flex justify-end pt-4 border-t border-base-content/10">
                        {status === "authenticated" ? (
                            <button className="btn btn-primary btn-lg pulse-glow" onClick={handleSubmit} disabled={submitting || selectedOption === null}>
                                {submitting ? <span className="loading loading-spinner"></span> : "Finalize & Submit Answer"}
                            </button>
                        ) : (
                            <Link href="/api/auth/signin" className="btn btn-primary btn-lg pulse-glow">Sign in to Participate</Link>
                        )}
                    </div>
                )}

                {hasAnswered && question.explanation && (
                    <div className="mt-8 bg-base-200/50 p-6 rounded-2xl border border-base-content/10">
                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Explanation
                        </h3>
                        <p className="text-base-content/80 leading-relaxed font-medium">{question.explanation}</p>

                        {result && (
                            <div className={`mt-6 alert ${result.isCorrect ? 'alert-success border-success text-success-content' : 'alert-error border-error text-error-content'} shadow-lg`}>
                                <div>
                                    <h4 className="font-black text-lg">{result.isCorrect ? "Brilliant Setup!" : "Not Quite Precise!"}</h4>
                                    <p className="text-sm font-medium opacity-90">Reward Yield: +{result.pointsEarned} XP. Your global standing is {result.newRank}.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {hasAnswered && (
                <div className="mt-12">
                    <CommentSection targetType="question" targetId={question._id} />
                </div>
            )}

            {!hasAnswered && (
                <div className="text-center opacity-40 text-sm mt-12 pb-12 font-bold tracking-widest uppercase">
                    Submit your solution to unlock community discussions
                </div>
            )}
        </div>
    );
}
