export default function TermsOfUsePage() {
    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black mb-8">Terms of Use</h1>
            <div className="prose prose-lg dark:prose-invert max-w-none text-base-content/70">
                <p>Last updated: October 2026</p>

                <h2 className="text-2xl font-bold mt-8 mb-4 text-base-content">1. Acceptance of Terms</h2>
                <p>By accessing and using RankUp ("the Platform"), you agree to be bound by these Terms of Use and all applicable laws and regulations.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4 text-base-content">2. Account Registration</h2>
                <p>To access certain features of the Platform (such as saving XP and Ranks), you must register for an account using a supported OAuth provider or email. You are responsible for maintaining the confidentiality of your account credentials.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4 text-base-content">3. OpenAI and Generating Content</h2>
                <p>The Platform utilizes OpenAI's API to dynamically generate test questions. We do not guarantee the absolute accuracy of dynamically generated questions and hold no liability for errors in the AI-generated content.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4 text-base-content">4. Fair Play & Conduct</h2>
                <p>RankUp is a competitive gamified platform. The use of automated bots, scripts, or exploitation of the difficulty scaling engine to artificially inflate your Rank is strictly prohibited and will result in a permanent ban.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4 text-base-content">5. Modifications</h2>
                <p>RankUp reserves the right to modify these terms at any time. Your continued use of the Platform following any changes indicates your acceptance of the new Terms of Use.</p>
            </div>
        </div>
    );
}
