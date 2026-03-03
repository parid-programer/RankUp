import { TrophyIcon, BoltIcon } from "@/app/icons";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
    await dbConnect();

    // Fetch top 50 users sorted by XP descending
    const topUsers = await User.find({})
        .sort({ xp: -1 })
        .limit(50)
        .select("name image rank xp matchesPlayed")
        .lean();

    return (
        <div className="min-h-screen py-20 px-6 max-w-5xl mx-auto">
            <div className="text-center mb-16 space-y-4">
                <TrophyIcon className="h-12 w-12 text-warning mx-auto drop-shadow-lg mb-4" />
                <h1 className="text-5xl md:text-6xl font-black">
                    Global <span className="gradient-text">Leaderboard</span>
                </h1>
                <p className="text-base-content/60 text-lg max-w-xl mx-auto">
                    The top 50 sharpest minds on RankUp. Play tests, earn XP, and secure
                    your place among the Grandmasters.
                </p>
            </div>

            <div className="glass-card rounded-3xl overflow-hidden shadow-2xl relative">
                {/* Glow effect */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="overflow-x-auto relative z-10">
                    <table className="table table-lg">
                        <thead>
                            <tr className="border-b border-base-content/10 text-base-content/50 uppercase text-xs tracking-wider">
                                <th className="w-20 text-center">Rank</th>
                                <th>Player</th>
                                <th>Tier</th>
                                <th className="text-right">Matches</th>
                                <th className="text-right">Total XP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topUsers.map((user: any, index: number) => {
                                const isTop3 = index < 3;
                                return (
                                    <tr
                                        key={user._id.toString()}
                                        className={`border-b border-base-content/5 transition-colors hover:bg-base-content/5 ${isTop3 ? "bg-base-content/5" : ""
                                            }`}
                                    >
                                        <td className="text-center">
                                            <div
                                                className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${index === 0
                                                    ? "bg-warning text-warning-content shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                                                    : index === 1
                                                        ? "bg-slate-300 text-slate-800"
                                                        : index === 2
                                                            ? "bg-amber-700 text-amber-100"
                                                            : "bg-base-content/10 text-base-content/60"
                                                    }`}
                                            >
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-4">
                                                <div className="avatar placeholder">
                                                    <div
                                                        className={`w-10 md:w-12 rounded-full ${isTop3
                                                            ? "ring ring-primary ring-offset-base-100 ring-offset-2"
                                                            : ""
                                                            }`}
                                                    >
                                                        {user.image ? (
                                                            <img src={user.image} alt={user.name} />
                                                        ) : (
                                                            <div className="bg-primary/20 text-primary w-full h-full flex items-center justify-center font-bold">
                                                                {user.name[0]?.toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className={`font-bold ${isTop3 ? "text-lg" : ""}`}>
                                                        {user.name}
                                                    </p>
                                                    {isTop3 && (
                                                        <span className="text-primary text-xs flex items-center gap-1 font-bold mt-1">
                                                            <BoltIcon className="w-3 h-3" /> Top Player
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge badge-sm uppercase tracking-wider font-bold ${user.rank === "Grandmaster"
                                                    ? "bg-gradient-to-r from-rose-400 to-pink-600 text-white border-none"
                                                    : user.rank === "Master"
                                                        ? "bg-gradient-to-r from-purple-400 to-fuchsia-500 text-white border-none"
                                                        : user.rank === "Diamond"
                                                            ? "bg-gradient-to-r from-cyan-300 to-teal-500 text-white border-none"
                                                            : "badge-ghost"
                                                    }`}
                                            >
                                                {user.rank}
                                            </span>
                                        </td>
                                        <td className="text-right text-base-content/60 font-mono">
                                            {user.matchesPlayed || 0}
                                        </td>
                                        <td className="text-right">
                                            <span className="font-mono font-bold text-primary text-lg md:text-xl">
                                                {user.xp.toLocaleString()}
                                            </span>
                                            <span className="text-xs text-base-content/40 ml-1">
                                                XP
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}

                            {topUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-20">
                                        <p className="text-base-content/50">
                                            No players yet. Be the first to take a test!
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
