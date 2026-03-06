import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { notFound } from "next/navigation";
import CommentSection from "@/components/CommentSection";

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const resolvedParams = await params;

    let user;
    let subjects = {};
    try {
        user = await User.findById(resolvedParams.id).lean();
        subjects = user?.subjects || {};
    } catch {
        return notFound();
    }

    if (!user) {
        notFound();
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 max-w-4xl mx-auto">
            <div className="glass-card flex flex-col items-center p-10 rounded-3xl relative overflow-hidden mb-12 shadow-xl border border-primary/10">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/30 to-secondary/30 blur-[40px] -z-10"></div>

                <div className="avatar mb-6 indicator">
                    {user.presence === "online" && <span className="indicator-item badge badge-success w-4 h-4 rounded-full border-2 border-base-100 shadow-sm" title="Online"></span>}
                    {user.presence === "offline" && <span className="indicator-item badge badge-neutral w-4 h-4 rounded-full border-2 border-base-100 shadow-sm" title="Offline"></span>}
                    {user.presence === "invisible" && <span className="indicator-item w-4 h-4 rounded-full border-2 border-base-100 shadow-sm bg-base-300" title="Invisible"></span>}
                    <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-4 bg-base-300">
                        {user.image ? (
                            <img src={user.image} alt={user.name} className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold bg-primary/20 text-primary">
                                {user.name?.[0]?.toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center">
                    <h1 className="text-4xl font-black mb-2 tracking-tight">{user.name}</h1>
                    <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                        <span className="badge badge-primary">{user.rank || "Bronze"}</span>
                        {user.customStatus && <span className="badge badge-outline shadow-sm italic">&quot;{user.customStatus}&quot;</span>}
                    </div>
                    {user.bio && (
                        <p className="max-w-lg mx-auto text-base-content/80 text-lg leading-relaxed">{user.bio}</p>
                    )}
                </div>

                <div className="stats shadow bg-base-200/50 w-full mt-8 max-w-2xl border border-base-content/5">
                    <div className="stat place-items-center">
                        <div className="stat-title opacity-70">Total Rank XP</div>
                        <div className="stat-value text-secondary text-3xl">{user.xp?.toLocaleString() || "0"}</div>
                    </div>
                    <div className="stat place-items-center border-l border-base-content/10">
                        <div className="stat-title opacity-70">Matches Played</div>
                        <div className="stat-value text-primary text-3xl">{user.matchesPlayed || "0"}</div>
                    </div>
                </div>

                {Object.keys(subjects).length > 0 && (
                    <div className="w-full mt-8 max-w-2xl">
                        <h3 className="text-xl font-bold mb-4 text-center">Subject Proficiency</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(subjects).map(([subjectName, data]: [string, any]) => (
                                <div key={subjectName} className="bg-base-300/50 border border-base-content/10 p-4 rounded-xl text-center shadow-sm">
                                    <h4 className="font-bold text-sm mb-1">{subjectName}</h4>
                                    <div className="flex flex-col gap-1 items-center justify-center">
                                        <span className={`badge badge-sm font-bold opacity-90 ${data.rank === "Grandmaster" ? "bg-gradient-to-r from-rose-400 to-pink-600 text-white border-none" :
                                                data.rank === "Master" ? "bg-gradient-to-r from-purple-400 to-fuchsia-500 text-white border-none" :
                                                    data.rank === "Diamond" ? "bg-gradient-to-r from-cyan-300 to-teal-500 text-white border-none" :
                                                        "badge-neutral"
                                            }`}>{data.rank}</span>
                                        <span className="text-xs text-secondary font-mono">{data.xp.toLocaleString()} XP</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Initialize the recursively rendering Social engine targetted at user's specific profile ID */}
            <CommentSection targetType="profile" targetId={user._id.toString()} />
        </div>
    );
}
