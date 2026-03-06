import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import CommentSection from "@/components/CommentSection";
import ShareProfileButton from "@/components/ShareProfileButton";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    await dbConnect();

    const dbUser = await User.findById(session.user.id).lean();
    const subjects = dbUser?.subjects || {};

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black mb-8 text-center text-secondary drop-shadow-sm">Your Identity</h1>
            <div className="glass-card flex flex-col items-center p-10 rounded-3xl relative overflow-hidden mb-12 shadow-xl border border-primary/10">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/30 to-secondary/30 blur-[40px] -z-10"></div>

                <div className="avatar mb-6 indicator">
                    {session.user.presence === "online" && <span className="indicator-item badge badge-success w-4 h-4 rounded-full border-2 border-base-100 shadow-sm" title="Online"></span>}
                    {session.user.presence === "offline" && <span className="indicator-item badge badge-neutral w-4 h-4 rounded-full border-2 border-base-100 shadow-sm" title="Offline"></span>}
                    {session.user.presence === "invisible" && <span className="indicator-item w-4 h-4 rounded-full border-2 border-base-100 shadow-sm bg-base-300" title="Invisible"></span>}
                    <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-4 bg-base-300">
                        {session.user.image ? (
                            <img src={session.user.image} alt="User Avatar" className="object-cover" />
                        ) : (
                            <div className="bg-primary/20 text-primary w-full h-full flex items-center justify-center font-bold text-4xl">
                                {session.user.name?.[0]?.toUpperCase() || "U"}
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center">
                    <h2 className="text-4xl font-black mb-2 tracking-tight">{session.user.name}</h2>
                    <p className="text-base-content/50 mb-3 font-medium tracking-wide">{session.user.email}</p>

                    <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                        <span className="badge badge-primary">{session.user.rank || "Bronze"}</span>
                        {session.user.customStatus && <span className="badge badge-outline shadow-sm italic">&quot;{session.user.customStatus}&quot;</span>}
                    </div>

                    {session.user.bio && (
                        <p className="max-w-lg mx-auto text-base-content/80 text-lg leading-relaxed">{session.user.bio}</p>
                    )}

                    <ShareProfileButton userId={session.user.id} />
                </div>

                <div className="stats shadow bg-base-200/50 w-full mt-6">
                    <div className="stat place-items-center">
                        <div className="stat-title text-base-content/50">Current Rank</div>
                        <div className="stat-value text-primary text-2xl">{dbUser?.rank || "Bronze"}</div>
                    </div>

                    <div className="stat place-items-center">
                        <div className="stat-title text-base-content/50">Total XP</div>
                        <div className="stat-value text-secondary text-2xl">{dbUser?.xp?.toLocaleString() || "0"}</div>
                    </div>
                </div>

                {Object.keys(subjects).length > 0 && (
                    <div className="w-full mt-6">
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

            <div className="mt-8 mb-4">
                <h3 className="text-2xl font-black mb-4">Your Wall</h3>
                <p className="text-base-content/70 mb-6">This is your personal discussion board. Friends and challengers can leave messages for you here.</p>
                <CommentSection targetType="profile" targetId={session.user.id} />
            </div>
        </div>
    );
}
