import React from "react";

export default function Loading() {
    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center">
            {/* Header Skeleton */}
            <div className="w-64 h-12 bg-base-300 animate-pulse rounded-xl mb-6"></div>

            {/* Filter Skeleton */}
            <div className="w-full max-w-xs h-12 bg-base-300 animate-pulse rounded-full mb-12"></div>

            {/* Ladder Container Skeleton */}
            <div className="w-full bg-base-200/50 rounded-box border border-base-content/10 overflow-hidden shadow-sm">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center p-4 md:p-6 border-b border-base-content/5 opacity-80">
                        {/* Rank Position */}
                        <div className="w-12 h-12 bg-base-300 animate-pulse rounded-full mr-4 flex-shrink-0"></div>

                        {/* Avatar */}
                        <div className="w-16 h-16 bg-base-300 animate-pulse rounded-full mr-6 flex-shrink-0"></div>

                        {/* Player Info */}
                        <div className="flex-1">
                            <div className="w-32 h-6 bg-base-300 animate-pulse rounded-md mb-2"></div>
                            <div className="w-20 h-4 bg-base-300 animate-pulse rounded-md"></div>
                        </div>

                        {/* XP Skeleton */}
                        <div className="w-24 h-8 bg-base-300 animate-pulse rounded-lg"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
