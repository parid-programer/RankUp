export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black mb-8">Privacy Policy</h1>
            <div className="prose prose-lg dark:prose-invert max-w-none text-base-content/70">
                <p>Last updated: October 2026</p>

                <h2 className="text-2xl font-bold mt-8 mb-4 text-base-content">1. Information We Collect</h2>
                <p>When you register for RankUp, we collect your email address, name, and profile picture provided by your OAuth provider (Google or Facebook) or the email you use to register directly. We also track your performance history, current rank, and XP.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4 text-base-content">2. How We Use Your Information</h2>
                <p>Your data is used to:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>Maintain your Session and authenticate your identity.</li>
                    <li>Display your profile on the public Leaderboard.</li>
                    <li>Calculate and adjust your difficulty level during testing.</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4 text-base-content">3. Data Security & Storage</h2>
                <p>We use industry-standard security measures to protect your personal information. Active passwords (if you do not use OAuth) are securely hashed using bcrypt. All data is securely stored within MongoDB Atlas.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4 text-base-content">4. Third-Party Services</h2>
                <p>We rely on OpenAI to generate questions. We do not share your personal identifiable information (PII) with OpenAI. We may, however, send context about your difficulty level.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4 text-base-content">5. Your Rights</h2>
                <p>You have the right to request access to, correction of, or deletion of your personal data at any time. Contact us through the Support page to initiate a data deletion request.</p>
            </div>
        </div>
    );
}
