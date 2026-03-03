"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type Question = {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
};

export default function TestPage() {
    const { status } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [question, setQuestion] = useState<Question | null>(null);
    const [difficulty, setDifficulty] = useState(1);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isTestActive, setIsTestActive] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/api/auth/signin");
        }
    }, [status, router]);

    const fetchQuestion = async (currentDifficulty: number) => {
        setLoading(true);
        setSelectedAnswer(null);
        setFeedback(null);
        try {
            const res = await fetch("/api/questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ difficulty: currentDifficulty }),
            });
            const data = await res.json();
            if (res.ok) setQuestion(data);
            else console.error(data.error);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const startTest = () => {
        setIsTestActive(true);
        setScore(0);
        setDifficulty(1);
        setTimeLeft(60);
        setStreak(0);
        fetchQuestion(1);
    };

    const endTest = async () => {
        setIsTestActive(false);
        setQuestion(null);

        // Submit score
        if (score > 0) {
            try {
                await fetch("/api/test/submit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ xpChange: score }),
                });
            } catch (e) {
                console.error("Failed to submit score", e);
            }
        }
    };

    const handleAnswerClick = (index: number) => {
        if (selectedAnswer !== null || !question) return;

        setSelectedAnswer(index);
        const isCorrect = index === question.correctAnswerIndex;

        if (isCorrect) {
            setFeedback("correct");
            const pointsEarned = 10 * difficulty * (1 + streak * 0.1);
            setScore((prev) => prev + Math.round(pointsEarned));
            setStreak((prev) => prev + 1);
            setDifficulty((prev) => Math.min(10, prev + 1));

            setTimeout(() => fetchQuestion(Math.min(10, difficulty + 1)), 2000);
        } else {
            setFeedback("incorrect");
            const pointsLost = 5 * difficulty; // penalty
            setScore((prev) => Math.max(0, prev - pointsLost));
            setStreak(0);
            setDifficulty((prev) => Math.max(1, prev - 1));

            setTimeout(() => fetchQuestion(Math.max(1, difficulty - 1)), 3500);
        }
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isTestActive && timeLeft > 0 && !feedback) {
            timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        } else if (timeLeft === 0 && isTestActive) {
            endTest();
        }
        return () => clearInterval(timer);
    }, [isTestActive, timeLeft, feedback, endTest]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner text-primary loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-10 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8 glass-card p-4 rounded-2xl">
                <div className="flex gap-4">
                    <div className="stat-value text-primary">{score} XP</div>
                    {streak >= 3 && (
                        <div className="badge badge-accent animate-pulse badge-lg">
                            🔥 {streak} Streak
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xl font-mono countdown">
                        {/* @ts-expect-error - daisyui countdown styling */}
                        <span style={{ "--value": timeLeft }}></span>
                    </span>
                    <span className="text-base-content/50 uppercase text-xs font-bold">
                        Secs Left
                    </span>
                </div>
            </div>

            {!isTestActive ? (
                <div className="text-center mt-20">
                    <h1 className="text-4xl font-black mb-4">Adaptive Knowledge Test</h1>
                    <p className="text-base-content/60 max-w-lg mx-auto mb-8">
                        Answer rapidly scaling AI-generated questions. Get them right to
                        increase difficulty and earn multipliers. Get them wrong, lose points.
                    </p>
                    <button
                        onClick={startTest}
                        className="btn btn-primary btn-lg pulse-glow"
                    >
                        Start Session (60s)
                    </button>
                </div>
            ) : (
                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center"
                            >
                                <div className="loading loading-bars loading-md text-primary mb-2"></div>
                                <p className="text-sm text-base-content/50 animate-pulse">
                                    Generating Lvl {difficulty} Question...
                                </p>
                            </motion.div>
                        ) : question ? (
                            <motion.div
                                key={question.question}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="glass-card p-6 md:p-10 rounded-3xl"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <span className="badge badge-outline">Lvl {difficulty}</span>
                                </div>

                                <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-tight">
                                    {question.question}
                                </h2>

                                <div className="space-y-3">
                                    {question.options.map((opt, idx) => {
                                        let btnClass = "btn btn-outline btn-lg w-full justify-start h-auto py-4 font-normal text-left";
                                        if (selectedAnswer !== null) {
                                            if (idx === question.correctAnswerIndex) {
                                                btnClass = "btn btn-success btn-lg w-full justify-start h-auto py-4 text-left pointer-events-none";
                                            } else if (idx === selectedAnswer) {
                                                btnClass = "btn btn-error btn-lg w-full justify-start h-auto py-4 text-left pointer-events-none";
                                            } else {
                                                btnClass = "btn btn-outline btn-lg w-full justify-start h-auto py-4 opacity-50 pointer-events-none text-left";
                                            }
                                        }

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleAnswerClick(idx)}
                                                className={btnClass}
                                                disabled={selectedAnswer !== null}
                                            >
                                                <span className="mr-3 font-mono opacity-50">
                                                    {String.fromCharCode(65 + idx)}
                                                </span>
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>

                                {feedback && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`mt-6 p-4 rounded-xl text-sm ${feedback === "correct"
                                            ? "bg-success/10 text-success"
                                            : "bg-error/10 text-error"
                                            }`}
                                    >
                                        <p className="font-bold mb-1">
                                            {feedback === "correct" ? "Correct!" : "Incorrect."}
                                        </p>
                                        <p>{question.explanation}</p>
                                    </motion.div>
                                )}
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
