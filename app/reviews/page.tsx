import { StarIcon } from "@/app/icons";

const reviews = [
    {
        name: "Alex C.",
        rank: "Grandmaster",
        text: "The adaptive AI is ruthless but incredibly fair. Once you hit Diamond, every question feels like a major exam. Highly addictive!",
        avatar: "AC",
        color: "from-rose-400 to-pink-600",
    },
    {
        name: "Sarah T.",
        rank: "Master",
        text: "I used this to study for my finals. The gamification mechanics forced me to focus harder than any traditional study guide ever could.",
        avatar: "ST",
        color: "from-purple-400 to-fuchsia-500",
    },
    {
        name: "David K.",
        rank: "Platinum",
        text: "Love the UI, love the smooth animations. Best testing platform I've ever used. Still trying to break into the Diamond tier!",
        avatar: "DK",
        color: "from-cyan-300 to-teal-500",
    },
    {
        name: "Elena R.",
        rank: "Gold",
        text: "The streak multipliers are insane. Losing a 10-streak because of a stupid mistake on a Level 3 question hurts the soul, but I keep coming back.",
        avatar: "ER",
        color: "from-yellow-400 to-amber-500",
    },
];

export default function ReviewsPage() {
    return (
        <div className="min-h-screen py-20 px-6 max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-4">
                <h1 className="text-5xl font-black">
                    What the <span className="gradient-text">World Says</span>
                </h1>
                <p className="text-base-content/60 text-lg max-w-xl mx-auto">
                    Read testimonials from our top-ranked players who use RankUp daily to
                    sharpen their minds.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {reviews.map((r, i) => (
                    <div key={i} className="glass-card p-8 rounded-3xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${r.color} opacity-10 rounded-bl-full blur-2xl group-hover:opacity-20 transition-opacity`} />

                        <div className="flex gap-1 mb-6">
                            {[...Array(5)].map((_, j) => (
                                <StarIcon key={j} className="h-5 w-5 text-warning" />
                            ))}
                        </div>

                        <p className="text-lg leading-relaxed mb-8 relative z-10 italic">
                            &quot;{r.text}&quot;
                        </p>

                        <div className="flex items-center gap-4 relative z-10">
                            <div className="avatar placeholder">
                                <div className={`bg-gradient-to-br ${r.color} text-white w-12 rounded-full font-bold shadow-lg`}>
                                    <span>{r.avatar}</span>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold">{r.name}</h4>
                                <p className="text-xs text-base-content/50 uppercase font-bold tracking-wider">{r.rank}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
