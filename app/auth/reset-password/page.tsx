"use client";

import { useState, Suspense } from "react";
import { BoltIcon } from "@/app/icons";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        if (!token) {
            setError("Invalid or missing reset token.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage("Password has been reset successfully. Redirecting to login...");
                setTimeout(() => router.push("/auth/signin"), 3000);
            } else {
                setError(data.error || "Failed to reset password.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        }
        setLoading(false);
    };

    if (!token) {
        return (
            <div className="text-center">
                <p className="text-error font-bold mb-4">Invalid or missing reset token.</p>
                <Link href="/auth/forgot-password" className="btn btn-primary">Request New Reset Link</Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6">
            <div className="form-control">
                <input
                    type="password"
                    placeholder="New Password"
                    className="input input-bordered w-full bg-base-200/50"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <div className="form-control">
                <input
                    type="password"
                    placeholder="Confirm New Password"
                    className="input input-bordered w-full bg-base-200/50"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </div>

            {error && <div className="text-error text-sm font-bold text-center mt-2">{error}</div>}
            {message && <div className="text-success text-sm font-bold text-center mt-2">{message}</div>}

            <button type="submit" disabled={loading} className="btn btn-primary mt-2">
                {loading ? <span className="loading loading-spinner"></span> : "Reset Password"}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 pb-32">
            <div className="glass-card w-full max-w-md p-8 rounded-3xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none -z-10" />

                <div className="text-center mb-10">
                    <BoltIcon className="h-10 w-10 text-primary mx-auto mb-4" />
                    <h1 className="text-3xl font-black">Reset Password</h1>
                    <p className="text-base-content/60 mt-2">Enter your new password below.</p>
                </div>

                <Suspense fallback={<div className="text-center"><span className="loading loading-spinner"></span></div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
