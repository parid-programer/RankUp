import React from "react";

export default function Loading() {
    return (
        <div className="min-h-screen pt-32 pb-20 flex flex-col justify-center items-center">
            <div className="flex flex-col items-center gap-6">
                <div className="relative flex justify-center items-center">
                    {/* Pulsing ring background */}
                    <div className="absolute w-24 h-24 bg-primary/20 rounded-full animate-ping"></div>

                    {/* Primary spinner */}
                    <span className="loading loading-spinner text-primary w-16 h-16 relative z-10"></span>
                </div>

                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-pulse mt-4">
                    Fetching records...
                </h2>
            </div>
        </div>
    );
}
