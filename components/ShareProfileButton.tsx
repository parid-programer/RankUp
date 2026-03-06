"use client";

import { useState, useEffect } from "react";

export default function ShareProfileButton({ userId }: { userId: string }) {
    const [copied, setCopied] = useState(false);
    const [origin, setOrigin] = useState("");

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    const handleCopy = async () => {
        try {
            const url = `${origin}/profile/${userId}`;
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };



    if (!origin) return null;

    return (
        <div className="flex flex-col items-center gap-2 mt-4">
            <button onClick={handleCopy} className="btn btn-outline btn-sm shadow-sm gap-2 rounded-full px-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                {copied ? "Link Copied!" : "Share Profile"}
            </button>
            <div className="text-xs opacity-50 font-mono bg-base-300 px-3 py-1 rounded-md">
                {origin}/profile/{userId}
            </div>
        </div>
    );
}
