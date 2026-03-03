"use client";

import { useState } from "react";
import { SparklesIcon } from "@/app/icons";

export default function ContactPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            message: formData.get("message"),
        };

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                setSuccess(true);
                (e.target as HTMLFormElement).reset();
            } else {
                const errData = await res.json();
                setError(errData.error || "Failed to send message");
            }
        } catch (err: unknown) {
            console.error(err);
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-20 px-6 max-w-3xl mx-auto">
            <div className="text-center mb-12">
                <SparklesIcon className="h-10 w-10 text-primary mx-auto mb-4" />
                <h1 className="text-4xl md:text-5xl font-black mb-4">Contact Us</h1>
                <p className="text-base-content/60 text-lg">
                    Have a question or feedback? We&apos;d love to hear from you.
                </p>
            </div>

            <div className="glass-card p-8 md:p-12 rounded-3xl shadow-xl">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-bold">Your Name</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            placeholder="John Doe"
                            className="input input-bordered w-full bg-base-200/50"
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-bold">Your Email</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="john@example.com"
                            className="input input-bordered w-full bg-base-200/50"
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-bold">Message</span>
                        </label>
                        <textarea
                            name="message"
                            required
                            placeholder="How can we help you?"
                            className="textarea textarea-bordered h-32 bg-base-200/50"
                        ></textarea>
                    </div>

                    {error && <div className="text-error text-sm font-bold">{error}</div>}
                    {success && (
                        <div className="text-success text-sm font-bold">
                            Message sent successfully! We&apos;ll get back to you soon.
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary mt-4"
                    >
                        {loading ? (
                            <span className="loading loading-spinner"></span>
                        ) : (
                            "Send Message"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
