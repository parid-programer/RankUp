"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BoltIcon } from "@/app/icons";
import Link from "next/link";

export default function SignUpPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to sign up");
                setLoading(false);
                return;
            }

            // Automatically sign in the user after successful registration
            const signInRes = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (signInRes?.error) {
                setError(signInRes.error);
                setLoading(false);
            } else {
                router.push("/");
            }
        } catch (e) {
            setError("Something went wrong");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 pb-32">
            <div className="glass-card w-full max-w-md p-8 rounded-3xl relative overflow-hidden shadow-2xl">
                {/* Decorative background gradients */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none -z-10" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-[80px] pointer-events-none -z-10" />

                <div className="text-center mb-10">
                    <BoltIcon className="h-10 w-10 text-primary mx-auto mb-4" />
                    <h1 className="text-3xl font-black">Create Account</h1>
                    <p className="text-base-content/60 mt-2">Join the RankUp ecosystem today</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6">
                    <div className="form-control">
                        <input
                            type="text"
                            placeholder="Username"
                            className="input input-bordered w-full bg-base-200/50"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
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
                    <div className="form-control">
                        <input
                            type="password"
                            placeholder="Password"
                            className="input input-bordered w-full bg-base-200/50"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-control">
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            className="input input-bordered w-full bg-base-200/50"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="text-error text-sm font-bold text-center mt-2">{error}</div>}

                    <button type="submit" disabled={loading} className="btn btn-primary mt-2">
                        {loading ? <span className="loading loading-spinner"></span> : "Sign Up"}
                    </button>

                    <div className="text-center mt-4 text-sm text-base-content/60">
                        Already have an account? <Link href="/api/auth/signin" className="text-primary hover:underline font-bold transition-all">Sign In</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
