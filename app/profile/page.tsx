"use client";

import { useSession } from "next-auth/react";
import CommentSection from "@/components/CommentSection";
import ShareProfileButton from "@/components/ShareProfileButton";
import { redirect } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function ProfilePage() {
    const { data: session, status, update } = useSession({
        required: true,
        onUnauthenticated() {
            redirect("/api/auth/signin");
        },
    });

    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [customStatusInput, setCustomStatusInput] = useState("");
    const [isSavingStatus, setIsSavingStatus] = useState(false);

    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [dbUser, setDbUser] = useState<any>(null);
    const [loadingDb, setLoadingDb] = useState(true);

    useEffect(() => {
        if (session?.user) {
            setCustomStatusInput(session.user.customStatus || "");

            // Client side fetch of DB stats
            fetch('/api/user/profile')
                .then(res => res.json())
                .then(data => {
                    if (data.user) setDbUser(data.user);
                    setLoadingDb(false);
                })
                .catch(err => {
                    console.error("Failed fetching user data", err);
                    setLoadingDb(false);
                });
        }
    }, [session?.user]);


    if (status === "loading" || loadingDb) {
        return <div className="min-h-screen flex justify-center items-center"><span className="loading loading-spinner text-primary loading-lg"></span></div>;
    }

    if (!session?.user) return null;

    const subjects = dbUser?.subjects || {};

    const handleStatusSubmit = async () => {
        if (customStatusInput === session.user.customStatus) {
            setIsEditingStatus(false);
            return;
        }

        setIsSavingStatus(true);
        try {
            const res = await fetch("/api/user/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "updateProfile",
                    customStatus: customStatusInput,
                    bio: session.user.bio,
                    presence: session.user.presence,
                    image: session.user.image
                }),
            });
            if (res.ok) {
                await update({ customStatus: customStatusInput });
            }
        } catch (e) {
            console.error("Failed to update status", e);
            setCustomStatusInput(session.user.customStatus || ""); // Reset on fail
        } finally {
            setIsSavingStatus(false);
            setIsEditingStatus(false);
        }
    };

    const handleStatusKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleStatusSubmit();
        if (e.key === "Escape") {
            setCustomStatusInput(session.user.customStatus || "");
            setIsEditingStatus(false);
        }
    };

    // IMAGE UPLOAD LOGIC ==============================

    const uploadImage = async (file: File) => {
        // Ensure file is less than 2MB
        if (file.size > 2 * 1024 * 1024) {
            alert("Image must be smaller than 2MB.");
            return;
        }

        setIsUploadingImage(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            try {
                const res = await fetch("/api/user/settings", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "updateProfile",
                        image: base64String,
                        bio: session.user.bio,
                        customStatus: session.user.customStatus,
                        presence: session.user.presence
                    }),
                });
                if (res.ok) {
                    await update({ image: base64String });
                } else {
                    alert("Failed to update profile picture.");
                }
            } catch (e) {
                console.error("Upload failed", e);
                alert("An error occurred during upload.");
            } finally {
                setIsUploadingImage(false);
            }
        };
        reader.readAsDataURL(file);
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadImage(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            uploadImage(file);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black mb-8 text-center text-secondary drop-shadow-sm">Your Identity</h1>
            <div className="glass-card flex flex-col items-center p-10 rounded-3xl relative overflow-hidden mb-12 shadow-xl border border-primary/10">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/30 to-secondary/30 blur-[40px] -z-10"></div>

                <div className="avatar mb-6 indicator group relative cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileInput}
                        accept="image/png, image/jpeg, image/jpg"
                        className="hidden"
                    />

                    {session.user.presence === "online" && <span className="indicator-item badge badge-success w-4 h-4 rounded-full border-2 border-base-100 shadow-sm z-20" title="Online"></span>}
                    {session.user.presence === "offline" && <span className="indicator-item badge badge-neutral w-4 h-4 rounded-full border-2 border-base-100 shadow-sm z-20" title="Offline"></span>}
                    {session.user.presence === "invisible" && <span className="indicator-item w-4 h-4 rounded-full border-2 border-base-100 shadow-sm bg-base-300 z-20" title="Invisible"></span>}

                    <div className={`w-32 h-32 rounded-full ring ring-offset-base-100 ring-offset-4 bg-base-300 transition-all duration-200 
                        ${isDragging ? "ring-secondary scale-105" : "ring-primary group-hover:ring-secondary group-hover:ring-offset-8"}`}>

                        {isUploadingImage ? (
                            <div className="w-full h-full flex items-center justify-center bg-base-300/80 backdrop-blur-sm absolute inset-0 z-10 rounded-full">
                                <span className="loading loading-spinner text-primary"></span>
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 absolute inset-0 z-10 rounded-full transition-opacity text-white text-xs font-bold flex-col text-center p-2">
                                <span>Click to Browse</span>
                                <span className="hidden md:block opacity-70">or Drop Image</span>
                            </div>
                        )}

                        {session.user.image ? (
                            <img src={session.user.image} alt="User Avatar" className="object-cover relative z-0" />
                        ) : (
                            <div className="bg-primary/20 text-primary w-full h-full flex items-center justify-center font-bold text-4xl relative z-0">
                                {session.user.name?.[0]?.toUpperCase() || "U"}
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center w-full">
                    <h2 className="text-4xl font-black mb-2 tracking-tight">{session.user.name}</h2>
                    <p className="text-base-content/50 mb-3 font-medium tracking-wide">{session.user.email}</p>

                    <div className="flex items-center justify-center gap-2 mb-4 flex-wrap min-h-[32px]">
                        <span className="badge badge-primary">{session.user.rank || "Bronze"}</span>

                        {isEditingStatus ? (
                            <div className="flex items-center gap-1 transition-all">
                                <input
                                    autoFocus
                                    type="text"
                                    className="input input-bordered input-xs max-w-xs bg-base-200"
                                    value={customStatusInput}
                                    onChange={(e) => setCustomStatusInput(e.target.value)}
                                    onKeyDown={handleStatusKeyDown}
                                    onBlur={handleStatusSubmit}
                                    disabled={isSavingStatus}
                                    maxLength={60}
                                />
                                {isSavingStatus && <span className="loading loading-spinner loading-xs text-primary"></span>}
                            </div>
                        ) : (
                            <span
                                className="badge badge-outline shadow-sm italic cursor-pointer hover:bg-base-200 hover:border-primary transition-colors flex gap-1 items-center px-3"
                                onClick={() => setIsEditingStatus(true)}
                                title="Click to edit status"
                            >
                                {session.user.customStatus ? `"${session.user.customStatus}"` : <span className="opacity-50 text-xs">Set a status...</span>}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </span>
                        )}
                    </div>

                    {session.user.bio && (
                        <p className="max-w-lg mx-auto text-base-content/80 text-lg leading-relaxed">{session.user.bio}</p>
                    )}

                    <div className="mt-4">
                        <ShareProfileButton userId={session.user.id} />
                    </div>
                </div>

                <div className="stats shadow bg-base-200/50 w-full mt-6">
                    <div className="stat place-items-center">
                        <div className="stat-title text-base-content/50">Current Rank</div>
                        <div className="stat-value text-primary text-2xl">{dbUser?.rank || "Bronze"}</div>
                    </div>

                    <div className="stat place-items-center">
                        <div className="stat-title text-base-content/50">Total XP</div>
                        <div className="stat-value text-secondary text-2xl">{dbUser?.xp?.toLocaleString() || "0"}</div>
                    </div>
                </div>

                {Object.keys(subjects).length > 0 && (
                    <div className="w-full mt-6">
                        <h3 className="text-xl font-bold mb-4 text-center">Subject Proficiency</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(subjects).map(([subjectName, data]: [string, any]) => (
                                <div key={subjectName} className="bg-base-300/50 border border-base-content/10 p-4 rounded-xl text-center shadow-sm">
                                    <h4 className="font-bold text-sm mb-1">{subjectName}</h4>
                                    <div className="flex flex-col gap-1 items-center justify-center">
                                        <span className={`badge badge-sm font-bold opacity-90 ${data.rank === "Grandmaster" ? "bg-gradient-to-r from-rose-400 to-pink-600 text-white border-none" :
                                            data.rank === "Master" ? "bg-gradient-to-r from-purple-400 to-fuchsia-500 text-white border-none" :
                                                data.rank === "Diamond" ? "bg-gradient-to-r from-cyan-300 to-teal-500 text-white border-none" :
                                                    "badge-neutral"
                                            }`}>{data.rank}</span>
                                        <span className="text-xs text-secondary font-mono">{data.xp.toLocaleString()} XP</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 mb-4">
                <h3 className="text-2xl font-black mb-4">Your Wall</h3>
                <p className="text-base-content/70 mb-6">This is your personal discussion board. Friends and challengers can leave messages for you here.</p>
                <CommentSection targetType="profile" targetId={session.user.id} />
            </div>
        </div>
    );
}
