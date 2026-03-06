import "./home.css";
import Link from "next/link";
import {
  TrophyIcon,
  BoltIcon,
  ChartBarIcon,
  StarIcon,
  FireIcon,
  ArrowRightIcon,
  SparklesIcon,
  UserGroupIcon,
  ClockIcon,
} from "./icons";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

/* ───────── mock data ───────── */

const ranks = [
  { name: "Bronze", minScore: 0, color: "from-amber-700 to-amber-900", icon: "🥉", glow: "shadow-amber-700/30" },
  { name: "Silver", minScore: 1000, color: "from-slate-300 to-slate-500", icon: "🥈", glow: "shadow-slate-400/30" },
  { name: "Gold", minScore: 3000, color: "from-yellow-400 to-amber-500", icon: "🥇", glow: "shadow-yellow-400/30" },
  { name: "Platinum", minScore: 5000, color: "from-cyan-300 to-teal-500", icon: "💎", glow: "shadow-cyan-400/30" },
  { name: "Diamond", minScore: 7000, color: "from-blue-400 to-violet-500", icon: "💠", glow: "shadow-blue-400/30" },
  { name: "Master", minScore: 8500, color: "from-purple-400 to-fuchsia-500", icon: "🔮", glow: "shadow-purple-400/30" },
  { name: "Grandmaster", minScore: 9500, color: "from-rose-400 to-pink-600", icon: "👑", glow: "shadow-rose-400/30" },
];

const stats = [
  { label: "Active Players", value: "12,847", icon: UserGroupIcon },
  { label: "Tests Completed", value: "89,312", icon: ChartBarIcon },
  { label: "Avg. Session", value: "14 min", icon: ClockIcon },
];



// An app that will test a user and assign a score to them. There will be a leaderboard and a gamified system of ranks. Integrate tailwindcss and daisyui for styling. Make a /test page where the actual test is held. Use the chatgpt api to make questions. Depending on how many questions you get right, the next questions will be harder. If you get a question wrong, you lose points. If you get a question right, you gain points. Make a time limit. Integrate MongoDB to keep track of user scores and ranks and auth. Make a login page with JWT authentication and google and facebook authentication. Give it an about page, say stuff like its used all around the world, give it a reviews section and a contact me page which send emails to my email address. Make it look good. Give it a logo. 

/* ───────── page ───────── */
export default async function HomePage() {
  await dbConnect();
  const topUsers = await User.find({ xp: { $gt: 0 } })
    .sort({ xp: -1 })
    .limit(5)
    .select("name image rank xp")
    .lean();

  return (
    <div className="min-h-screen bg-base-100 overflow-x-hidden">
      {/* ─── Hero ─── */}
      <section className="relative py-24 lg:py-36 px-6 text-center overflow-hidden">
        {/* decorative blurs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto flex flex-col items-center gap-6">
          <div className="badge badge-outline badge-primary gap-1 animate-float">
            <SparklesIcon className="h-3 w-3" /> Season 4 is Live
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
            Prove Your Knowledge.{" "}
            <span className="gradient-text">Climb the Ranks.</span>
          </h1>

          <p className="text-base-content/60 max-w-xl text-lg">
            Take skill-based tests, earn points, and compete on a global
            leaderboard. Rise through seven tiers — from Bronze to Grandmaster.
          </p>

          <div className="flex gap-3 mt-2">
            <Link href="/test" className="btn btn-primary btn-lg pulse-glow gap-2">
              Start a Test <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <a href="#how-it-works" className="btn btn-outline btn-lg">How It Works</a>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="max-w-5xl mx-auto px-6 -mt-6 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="glass-card rounded-2xl p-5 flex items-center gap-4 hover:scale-[1.02] transition-transform"
            >
              <div className="bg-primary/10 p-3 rounded-xl">
                <s.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-base-content/50">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Leaderboard ─── */}
      <section id="leaderboard" className="max-w-5xl mx-auto px-6 mb-20">
        <div className="flex items-center gap-3 mb-8">
          <TrophyIcon className="h-7 w-7 text-warning" />
          <Link href="/leaderboard" className="text-3xl font-bold hover:underline hover:text-primary transition-colors">Leaderboard</Link>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-lg">
              <thead>
                <tr className="text-base-content/40 text-xs uppercase tracking-wider">
                  <th className="w-16">Rank</th>
                  <th>Player</th>
                  <th>Badge</th>
                  <th className="text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((p: any, index: number) => (
                  <tr
                    key={p._id.toString()}
                    className="hover:bg-base-content/5 transition-colors"
                  >
                    <td>
                      <RankBadge rank={index + 1} />
                    </td>
                    <td>
                      <Link href={`/profile/${p._id.toString()}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="avatar placeholder">
                          <div className="bg-primary/15 text-primary w-10 rounded-full text-sm font-bold overflow-hidden">
                            {p.image ? <img src={p.image} referrerPolicy="no-referrer" /> : <span>{p.name?.[0]?.toUpperCase() || "U"}</span>}
                          </div>
                        </div>
                        <span className="font-semibold hover:underline text-primary">{p.name}</span>
                      </Link>
                    </td>
                    <td>
                      <span className="badge badge-sm badge-ghost">
                        {p.rank || "Bronze"}
                      </span>
                    </td>
                    <td className="text-right font-mono font-bold text-primary">
                      {p.xp.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── Rank Tiers ─── */}
      <section id="ranks" className="max-w-5xl mx-auto px-6 mb-20">
        <div className="flex items-center gap-3 mb-8">
          <StarIcon className="h-7 w-7 text-warning" />
          <h2 className="text-3xl font-bold">Rank Tiers</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {ranks.map((r) => (
            <div
              key={r.name}
              className={`glass-card rounded-2xl p-5 flex flex-col items-center gap-3 hover:scale-105 transition-transform shadow-lg ${r.glow}`}
            >
              <span className="text-4xl">{r.icon}</span>
              <h3
                className={`text-lg font-bold bg-gradient-to-r ${r.color} bg-clip-text text-transparent`}
              >
                {r.name}
              </h3>
              <p className="text-xs text-base-content/40">
                {r.minScore === 0
                  ? "Starting rank"
                  : `${r.minScore.toLocaleString()}+ pts`}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 mb-20">
        <div className="flex items-center gap-3 mb-8">
          <FireIcon className="h-7 w-7 text-error" />
          <h2 className="text-3xl font-bold">How It Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Take a Test",
              desc: "Answer timed, skill-based questions across multiple categories.",
            },
            {
              step: "02",
              title: "Earn Points",
              desc: "Score points based on accuracy, speed, and streak bonuses.",
            },
            {
              step: "03",
              title: "Rank Up",
              desc: "Climb through seven tiers and compete on the global leaderboard.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="glass-card rounded-2xl p-7 flex flex-col gap-3 hover:border-primary/30 transition-colors"
            >
              <span className="text-5xl font-black text-primary/15">
                {item.step}
              </span>
              <h3 className="text-xl font-bold">{item.title}</h3>
              <p className="text-base-content/50 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 p-10 md:p-16 text-center">
          <div className="absolute inset-0 bg-base-100/50 backdrop-blur-md" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <h2 className="text-3xl md:text-4xl font-extrabold">
              Ready to prove yourself?
            </h2>
            <p className="text-base-content/50 max-w-md">
              Join thousands of players competing for the top spot. Your first
              test is free — no sign-up required.
            </p>
            <Link href="/test" className="btn btn-primary btn-lg mt-2 pulse-glow gap-2">
              Start Now <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ───────── small helpers ───────── */
function RankBadge({ rank }: { rank: number }) {
  const styles: Record<number, string> = {
    1: "bg-gradient-to-br from-yellow-400 to-amber-500 text-black",
    2: "bg-gradient-to-br from-slate-300 to-slate-400 text-black",
    3: "bg-gradient-to-br from-amber-600 to-amber-700 text-white",
  };
  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${styles[rank] ?? "bg-base-content/10 text-base-content/60"
        }`}
    >
      {rank}
    </span>
  );
}