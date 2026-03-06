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
    const { data: sessionData, status } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [nextQuestionPromise, setNextQuestionPromise] = useState<Promise<any> | null>(null);
    const [question, setQuestion] = useState<Question | null>(null);
    const [difficulty, setDifficulty] = useState(1);
    const [score, setScore] = useState(0);
    const [pendingTimeDeduction, setPendingTimeDeduction] = useState(0);
    const [currentPenalty, setCurrentPenalty] = useState(0);
    const timeDeductionRate = Number(process.env.NEXT_PUBLIC_TIME_DEDUCTION_RATE || "1");

    const [streak, setStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [duration, setDuration] = useState(60);
    const [isTestActive, setIsTestActive] = useState(false);
    const [subject, setSubject] = useState("General");
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
                body: JSON.stringify({ difficulty: currentDifficulty, subject }),
            });
            const data = await res.json();
            if (res.ok) {
                setQuestion(data);
                const penalty = 10 * currentDifficulty;
                setCurrentPenalty(penalty);
                // Do NOT subtract from visual score: setScore((prev) => prev - penalty);
                submitXPDelta(-penalty);
                setPendingTimeDeduction(0);
            }
            else console.error(data.error);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const startTest = async () => {
        setLoading(true);
        setIsTestActive(true);

        // Compute base difficulty dynamically from the user's specific Subject XP (fallback to 0) Max 10.
        let baseXP = 0;
        try {
            const res = await fetch(`/api/user/xp?subject=${encodeURIComponent(subject)}`);
            if (res.ok) {
                const data = await res.json();
                baseXP = data.xp || 0;
            }
        } catch (e) { console.error("Failed to fetch subject XP", e) }

        const startingLevel = Math.max(1, Math.min(10, Math.floor(baseXP / 1000) + 1));

        setScore(0);
        setDifficulty(startingLevel);
        setTimeLeft(duration);
        setStreak(0);
        setPendingTimeDeduction(0);
        setCurrentPenalty(0);
        await fetchQuestion(startingLevel);
    };

    const submitXPDelta = async (delta: number) => {
        if (delta === 0) return;
        try {
            await fetch("/api/test/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ xpChange: delta, subject }),
            });
        } catch (e) {
            console.error("Failed to submit delta", e);
        }
    };

    const handleNextQuestion = async () => {
        if (nextQuestionPromise) {
            setLoading(true);
            setFeedback(null);
            setSelectedAnswer(null);
            try {
                const data = await nextQuestionPromise;
                if (data && data.question) {
                    setQuestion(data);
                    const penalty = 10 * difficulty;
                    setCurrentPenalty(penalty);
                    // Do NOT subtract from visual score: setScore((prev) => prev - penalty);
                    submitXPDelta(-penalty);
                    setPendingTimeDeduction(0);
                } else {
                    throw new Error("Invalid prefetch data");
                }
            } catch (err) {
                console.error("Prefetch failed, falling back to load:", err);
                const nextDifficulty = feedback === "correct"
                    ? Math.min(10, difficulty + 1)
                    : Math.max(1, difficulty - 1);
                await fetchQuestion(nextDifficulty);
            } finally {
                setLoading(false);
                setNextQuestionPromise(null);
            }
        } else {
            const nextDifficulty = feedback === "correct"
                ? Math.min(10, difficulty + 1)
                : Math.max(1, difficulty - 1);
            fetchQuestion(nextDifficulty);
        }
    };

    const endTest = async () => {
        setIsTestActive(false);
        setQuestion(null);

        let finalDelta = -pendingTimeDeduction;

        // Timeout Refund: if we expire linearly on a question without answering, refund the upfront stealth-penalty.
        if (selectedAnswer === null && currentPenalty > 0) {
            finalDelta += currentPenalty;
        }

        if (finalDelta !== 0) {
            submitXPDelta(finalDelta);
        }
        setPendingTimeDeduction(0);
    };

    const handleAnswerClick = (index: number) => {
        if (selectedAnswer !== null || !question) return;

        setSelectedAnswer(index);
        const isCorrect = index === question.correctAnswerIndex;

        let nextDiff = difficulty;

        if (isCorrect) {
            setFeedback("correct");
            const pointsEarned = Math.round(10 * difficulty * (1 + streak * 0.1));
            const netPoints = currentPenalty + pointsEarned - pendingTimeDeduction;

            setScore((prev) => prev + pointsEarned - pendingTimeDeduction);
            setStreak((prev) => prev + 1);

            nextDiff = Math.min(10, difficulty + 1);
            setDifficulty(nextDiff);

            submitXPDelta(netPoints);
        } else {
            setFeedback("incorrect");
            // Penalty was paid immediately entirely upfront!
            setScore((prev) => prev - currentPenalty - pendingTimeDeduction);
            setStreak(0);

            nextDiff = Math.max(1, difficulty - 1);
            setDifficulty(nextDiff);

            submitXPDelta(-pendingTimeDeduction);
        }

        // Prefetch next question behind the scenes
        const p = fetch("/api/questions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ difficulty: nextDiff, subject }),
        }).then(res => {
            if (!res.ok) throw new Error("Prefetch response not ok");
            return res.json();
        });
        setNextQuestionPromise(p);
    };

    const isQuestionLoaded = !!question;

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isTestActive && timeLeft > 0 && !feedback && !loading) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
                if (timeDeductionRate > 0 && isQuestionLoaded) {
                    setScore((prev) => prev - timeDeductionRate);
                    setPendingTimeDeduction((prev) => prev + timeDeductionRate);
                }
            }, 1000);
        } else if (timeLeft <= 0 && isTestActive) {
            endTest();
        }
        return () => clearInterval(timer);
    }, [isTestActive, timeLeft, feedback, loading, isQuestionLoaded, timeDeductionRate, endTest]);

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

                    <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-8 text-left">
                        <div className="flex-1">
                            <label className="label font-bold">Select Category</label>
                            <select className="select select-bordered w-full bg-base-200" value={subject} onChange={e => setSubject(e.target.value)}>
                                <option value="General">🌐 General</option>
                                <option value="Mathematics">📐 Mathematics</option>
                                <option value="Science">🔬 Science</option>
                                <option value="History">🏛️ History</option>
                                <option value="Geography">🌍 Geography</option>
                                <option value="Computer Science">💻 Computer Science</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="label font-bold">Duration</label>
                            <select className="select select-bordered w-full bg-base-200" value={duration} onChange={e => setDuration(Number(e.target.value))}>
                                <option value={60}>⏱️ 1 Minute (60s)</option>
                                <option value={180}>⏱️ 3 Minutes (180s)</option>
                                <option value={300}>⏱️ 5 Minutes (300s)</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={startTest}
                        className="btn btn-primary btn-lg pulse-glow"
                    >
                        Start {subject} Session ({duration}s)
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
                                    <span className="badge badge-primary badge-outline">{subject !== "General" ? subject : "General Knowledge"}</span>
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
                                        <button className="btn btn-sm btn-ghost w-full mt-4 font-bold border border-base-content/20 bg-base-100 hover:bg-base-200 shadow-sm" onClick={handleNextQuestion}>
                                            Continue
                                        </button>
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
