import React from "react";

export default function Loading() {
    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-4xl mx-auto flex flex-col items-center">
            {/* Header Identity Skeleton */}
            <div className="w-64 h-12 bg-base-300 animate-pulse rounded-xl mb-8"></div>

            {/* Glass Card Container Skeleton */}
            <div className="w-full bg-base-200/50 p-10 rounded-3xl relative overflow-hidden mb-12 shadow-xl border border-base-content/10 flex flex-col items-center">

                {/* Avatar Skeleton */}
                <div className="w-32 h-32 bg-base-300 animate-pulse rounded-full mb-6 ring ring-base-100 ring-offset-4 ring-offset-base-100"></div>

                {/* Name & Email Skeletons */}
                <div className="w-48 h-10 bg-base-300 animate-pulse rounded-lg mb-4"></div>
                <div className="w-64 h-4 bg-base-300 animate-pulse rounded-md mb-6"></div>

                {/* Badge Skeleton */}
                <div className="w-24 h-6 bg-base-300 animate-pulse rounded-full mb-8"></div>

                {/* Stats Container Skeleton */}
                <div className="w-full flex gap-4 md:gap-8 justify-center">
                    <div className="w-1/3 max-w-[150px] h-24 bg-base-300 animate-pulse rounded-xl"></div>
                    <div className="w-1/3 max-w-[150px] h-24 bg-base-300 animate-pulse rounded-xl"></div>
                </div>

                {/* Subject Grid Skeleton */}
                <div className="w-full mt-10">
                    <div className="w-48 h-6 bg-base-300 animate-pulse rounded-md mx-auto mb-6"></div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-24 bg-base-300 animate-pulse rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Comment Wall Skeleton */}
            <div className="w-full mt-8">
                <div className="w-40 h-8 bg-base-300 animate-pulse rounded-md mb-4"></div>
                <div className="w-96 h-4 bg-base-300 animate-pulse rounded-md mb-8"></div>

                <div className="w-full max-w-2xl h-32 bg-base-300 animate-pulse rounded-xl mx-auto"></div>
            </div>
        </div>
    );
}
