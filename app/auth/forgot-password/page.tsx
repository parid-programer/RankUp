"use client";

import { useState } from "react";
import { BoltIcon } from "@/app/icons";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage("If an account with that email exists, we have sent a password reset link.");
            } else {
                setError(data.error || "Failed to process request.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 pb-32">
            <div className="glass-card w-full max-w-md p-8 rounded-3xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none -z-10" />

                <div className="text-center mb-10">
                    <BoltIcon className="h-10 w-10 text-primary mx-auto mb-4" />
                    <h1 className="text-3xl font-black">Reset Password</h1>
                    <p className="text-base-content/60 mt-2">Enter your email address to receive a password reset link.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6">
                    <div className="form-control">
                        <input
                            type="email"
                            placeholder="Email address"
                            className="input input-bordered w-full bg-base-200/50"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="text-error text-sm font-bold text-center mt-2">{error}</div>}
                    {message && <div className="text-success text-sm font-bold text-center mt-2">{message}</div>}

                    <button type="submit" disabled={loading} className="btn btn-primary mt-2">
                        {loading ? <span className="loading loading-spinner"></span> : "Send Reset Link"}
                    </button>

                    <div className="text-center mt-4">
                        <Link href="/auth/signin" className="text-sm text-base-content/60 hover:text-primary transition-colors">
                            Back to Sign In
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
