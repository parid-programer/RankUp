import dbConnect from "@/lib/mongodb";
import QuestionRecord from "@/models/QuestionRecord";
import Link from "next/link";
import { format } from "date-fns";

export default async function ArchiveList() {
    await dbConnect();
    // Only fetch globally distributed daily questions that are strictly in the "past"
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const questions = await QuestionRecord.find({
        isDaily: true,
        activeDate: { $lte: today }
    }).sort({ activeDate: -1 }).lean();

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl font-black mb-8 px-2">Gamification Archive</h1>
            <p className="text-base-content/70 mb-10 text-lg px-2">Review historical "Questions of the Day" and participate in long-term community discussions regarding optimized algorithms, code structure, and theoretical math models.</p>

            {questions.length === 0 ? (
                <div className="glass-card p-8 text-center opacity-60 rounded-3xl font-bold">No historical puzzles exist in the database yet. The global server must transition dates to populate this list.</div>
            ) : (
                <div className="flex flex-col gap-6">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {questions.map((q: any) => (
                        <Link href={`/archive/${q._id}`} key={q._id.toString()}>
                            <div className="glass-card p-6 rounded-2xl hover:border-primary/50 transition-all flex justify-between items-center group cursor-pointer hover:shadow-xl hover:scale-[1.01]">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="badge badge-error badge-sm">Difficulty {q.difficulty}/10</span>
                                        <span className="text-sm font-bold opacity-60 tracking-wider uppercase">{format(new Date(q.activeDate), "MMM do, yyyy")}</span>
                                    </div>
                                    <h3 className="text-xl font-bold line-clamp-2 leading-relaxed group-hover:text-primary transition-colors">{q.text}</h3>
                                </div>
                                <div className="hidden sm:flex shrink-0 ml-4 items-center justify-center p-4 bg-base-200 rounded-full group-hover:bg-primary/20 transition-colors">
                                    <svg className="w-5 h-5 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
