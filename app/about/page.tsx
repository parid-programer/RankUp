import { UserGroupIcon, StarIcon, TrophyIcon } from "@/app/icons";
import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="min-h-screen py-20 px-6 max-w-5xl mx-auto space-y-24">
            {/* ─── Hero ─── */}
            <section className="text-center space-y-6">
                <h1 className="text-5xl md:text-7xl font-black">
                    We believe in <span className="gradient-text">Global Knowledge</span>
                </h1>
                <p className="text-xl text-base-content/60 max-w-2xl mx-auto leading-relaxed">
                    RankUp was created to challenge the world&apos;s brightest minds. Our AI-driven
                    adaptive testing engine ensures that you are constantly pushed to the limits
                    of your ability. No two tests are the same.
                </p>
            </section>

            {/* ─── Mission & Impact ─── */}
            <section className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold">Our Impact</h2>
                    <p className="text-base-content/70 text-lg">
                        Since our launch in 2026, we have evaluated millions of users across 150+
                        countries. Our gamified system transforms standard multiple-choice
                        examinations into a globally competitive sport.
                    </p>
                    <div className="flex gap-4 pt-4">
                        <Link href="/test" className="btn btn-primary pulse-glow">
                            Take a Test
                        </Link>
                        <Link href="/leaderboard" className="btn btn-outline">
                            View Leaderboard
                        </Link>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                        <UserGroupIcon className="h-10 w-10 text-secondary mb-3" />
                        <h3 className="text-4xl font-black">2.4M</h3>
                        <p className="text-sm text-base-content/50 uppercase font-bold tracking-wider mt-1">Users</p>
                    </div>
                    <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center pt-10">
                        <StarIcon className="h-10 w-10 text-warning mb-3" />
                        <h3 className="text-4xl font-black">15M+</h3>
                        <p className="text-sm text-base-content/50 uppercase font-bold tracking-wider mt-1">Tests Taken</p>
                    </div>
                    <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center col-span-2">
                        <TrophyIcon className="h-10 w-10 text-accent mb-3" />
                        <h3 className="text-4xl font-black">Top 1%</h3>
                        <p className="text-sm text-base-content/50 uppercase font-bold tracking-wider mt-1">Acceptance to Grandmaster Tier</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
