import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black mb-8 text-center">Your Profile</h1>
            <div className="glass-card p-10 rounded-3xl max-w-lg mx-auto flex flex-col items-center gap-6">
                <div className="avatar">
                    <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        {session.user.image ? (
                            <img src={session.user.image} alt="User Avatar" />
                        ) : (
                            <div className="bg-primary/20 text-primary w-full h-full flex items-center justify-center font-bold text-3xl">
                                {session.user.name?.[0]?.toUpperCase() || "U"}
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center">
                    <h2 className="text-2xl font-bold">{session.user.name}</h2>
                    <p className="text-base-content/50">{session.user.email}</p>
                </div>

                <div className="stats shadow bg-base-200/50 w-full mt-4">
                    <div className="stat place-items-center">
                        <div className="stat-title text-base-content/50">Current Rank</div>
                        <div className="stat-value text-primary text-2xl">{session.user.rank || "Bronze"}</div>
                    </div>

                    <div className="stat place-items-center">
                        <div className="stat-title text-base-content/50">Total XP</div>
                        <div className="stat-value text-secondary text-2xl">{session.user.xp?.toLocaleString() || "0"}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
