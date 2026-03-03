"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("profile");

    // Profile state
    const [bio, setBio] = useState("");
    const [customStatus, setCustomStatus] = useState("");
    const [presence, setPresence] = useState("online");
    const [image, setImage] = useState("");

    // Security state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [qrCode, setQrCode] = useState("");
    const [totpSecret, setTotpSecret] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [email2faEnabled, setEmail2faEnabled] = useState(false);
    const [totpEnabled, setTotpEnabled] = useState(false);

    // UI state
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/api/auth/signin");
        }
        if (session?.user) {
            setBio(session.user.bio || "");
            setCustomStatus(session.user.customStatus || "");
            setPresence(session.user.presence || "online");
            if (session.user.image) setImage(session.user.image);
            if (session.user.email2faEnabled !== undefined) {
                setEmail2faEnabled(session.user.email2faEnabled);
            }
            if (session.user.twoFactorEnabled !== undefined) {
                setTotpEnabled(session.user.twoFactorEnabled);
            }
        }
    }, [status, session, router]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Ensure file is less than 2MB
        if (file.size > 2 * 1024 * 1024) {
            setMessage("Image must be smaller than 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result as string);
        }
        reader.readAsDataURL(file);
    };

    const handleProfileUpdate = async () => {
        setLoading(true);
        setMessage("");
        try {
            const res = await fetch("/api/user/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "updateProfile", bio, customStatus, presence, image }),
            });
            if (res.ok) {
                setMessage("Profile updated successfully!");
                await update({ bio, customStatus, presence, image });
            } else {
                setMessage("Failed to update profile.");
            }
        } catch (e) {
            setMessage("Error updating profile.");
        }
        setLoading(false);
    };

    const handlePasswordChange = async () => {
        setLoading(true);
        setMessage("");
        try {
            const res = await fetch("/api/user/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "changePassword", currentPassword, newPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage("Password updated successfully.");
                setCurrentPassword("");
                setNewPassword("");
            } else {
                setMessage(data.error || "Failed to update password.");
            }
        } catch (e) {
            setMessage("Error updating password.");
        }
        setLoading(false);
    };

    const handleTerminateSessions = async () => {
        if (!confirm("This will log you out of all devices including this one. Continue?")) return;
        setLoading(true);
        try {
            const res = await fetch("/api/user/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "terminateSessions" }),
            });
            if (res.ok) {
                await signOut({ callbackUrl: "/api/auth/signin" });
            }
        } catch (e) {
            setMessage("Failed to terminate sessions.");
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("CRITICAL WARNING: This will permanently delete your account, total acquired XP, and associated metadata. Data cannot be recovered. Are you absolutely sure?")) return;
        setLoading(true);
        try {
            const res = await fetch("/api/user/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "deleteAccount" }),
            });
            if (res.ok) {
                await signOut({ callbackUrl: "/" });
            } else {
                setMessage("Failed to delete account.");
                setLoading(false);
            }
        } catch (e) {
            setMessage("Error deleting account.");
            setLoading(false);
        }
    };

    const generate2FA = async () => {
        setLoading(true);
        setMessage("");
        try {
            const res = await fetch("/api/auth/2fa/generate", { method: "POST" });
            const data = await res.json();
            if (data.qrCodeUrl) {
                setQrCode(data.qrCodeUrl);
                setTotpSecret(data.secret);
            }
        } catch (e) {
            setMessage("Failed to generate 2FA.");
        }
        setLoading(false);
    };

    const verify2FA = async () => {
        setLoading(true);
        setMessage("");
        try {
            const res = await fetch("/api/auth/2fa/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: otpCode, secret: totpSecret }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage("2FA Enabled Successfully!");
                setQrCode("");
                setOtpCode("");
                setTotpEnabled(true);
                await update({ twoFactorEnabled: true });
            } else {
                setMessage(data.error || "Invalid code.");
            }
        } catch (e) {
            setMessage("Error verifying 2FA.");
        }
        setLoading(false);
    };

    const disableTOTP = async () => {
        if (!confirm("Are you sure you want to disable your Authenticator App?")) return;
        setLoading(true);
        try {
            const res = await fetch("/api/user/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "disableTOTP" }),
            });
            if (res.ok) {
                setTotpEnabled(false);
                setMessage("Authenticator App disabled successfully.");
                await update({ twoFactorEnabled: false });
            } else {
                setMessage("Failed to disable Authenticator App.");
            }
        } catch (e) {
            setMessage("Error disabling Authenticator App.");
        }
        setLoading(false);
    };

    const toggleEmail2FA = async () => {
        setLoading(true);
        try {
            const newState = !email2faEnabled;
            const res = await fetch("/api/user/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "toggleEmail2FA", enabled: newState }),
            });
            if (res.ok) {
                setEmail2faEnabled(newState);
                setMessage(`Email Authenticator successfully ${newState ? 'enabled' : 'disabled'}.`);
                await update({ email2faEnabled: newState });
            } else {
                setMessage("Failed to update Email 2FA settings.");
            }
        } catch (e) {
            setMessage("Error updating Email 2FA settings.");
        }
        setLoading(false);
    };

    if (status === "loading") return <div className="min-h-screen flex justify-center items-center"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 max-w-3xl mx-auto">
            <h1 className="text-4xl font-black mb-8">Settings</h1>

            {message && (
                <div className="alert alert-info mb-6 shadow-lg">
                    <span>{message}</span>
                </div>
            )}

            <div className="tabs tabs-boxed mb-8 glass-card border border-base-content/10">
                <button className={`tab tab-lg ${activeTab === "profile" ? "tab-active bg-primary text-primary-content" : ""}`} onClick={() => setActiveTab("profile")}>Profile</button>
                <button className={`tab tab-lg ${activeTab === "security" ? "tab-active bg-primary text-primary-content" : ""}`} onClick={() => setActiveTab("security")}>Security & Sessions</button>
            </div>

            {activeTab === "profile" && (
                <div className="glass-card p-6 md:p-8 rounded-2xl flex flex-col gap-6">
                    <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                        <div className="avatar">
                            <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 bg-base-300">
                                {image ? (
                                    <img src={image} alt="Profile Picture" className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-primary/50">?</div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col flex-1 gap-2 w-full">
                            <label className="label font-bold py-0">Custom Profile Picture</label>
                            <input type="file" className="file-input file-input-bordered w-full max-w-xs bg-base-200" accept="image/png, image/jpeg, image/jpg" onChange={handleImageUpload} />
                            <span className="text-xs opacity-50">Upload a PNG or JPG up to 2MB</span>
                        </div>
                    </div>

                    <div className="divider my-2"></div>

                    <div>
                        <label className="label font-bold">Bio</label>
                        <textarea className="textarea textarea-bordered w-full h-24 bg-base-200" placeholder="Tell us about yourself..." value={bio} onChange={e => setBio(e.target.value)} maxLength={250}></textarea>
                    </div>
                    <div>
                        <label className="label font-bold">Custom Status</label>
                        <input type="text" className="input input-bordered w-full bg-base-200" placeholder="What's on your mind?" value={customStatus} onChange={e => setCustomStatus(e.target.value)} maxLength={60} />
                    </div>
                    <div>
                        <label className="label font-bold">Global Presence</label>
                        <select className="select select-bordered w-full bg-base-200" value={presence} onChange={e => setPresence(e.target.value)}>
                            <option value="online">🟢 Online</option>
                            <option value="offline">⚪ Offline</option>
                            <option value="invisible">🕵️ Invisible</option>
                        </select>
                    </div>
                    <button className="btn btn-primary mt-4" onClick={handleProfileUpdate} disabled={loading}>Save Profile Configurations</button>
                </div>
            )}

            {activeTab === "security" && (
                <div className="glass-card p-6 md:p-8 rounded-2xl flex flex-col gap-8">
                    {/* Password Change */}
                    <section>
                        <h3 className="text-2xl font-bold mb-4">Change Password</h3>
                        <div className="flex flex-col gap-3">
                            <input type="password" placeholder="Current Password (leave blank if social login)" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="input input-bordered w-full bg-base-200" />
                            <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input input-bordered w-full bg-base-200" />
                            <button className="btn btn-primary" onClick={handlePasswordChange} disabled={loading || !newPassword}>Update Credentials</button>
                        </div>
                    </section>

                    <div className="divider"></div>

                    {/* 2FA Setup */}
                    <section>
                        <h3 className="text-2xl font-bold mb-4">Two-Factor Authentication</h3>
                        <p className="text-sm opacity-70 mb-6">Secure your account with an external authenticator app or receive verification codes directly to your inbox.</p>

                        <div className="flex flex-col gap-6">
                            <div className="bg-base-200 p-6 rounded-2xl border border-base-content/10">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h4 className="font-bold text-lg flex items-center gap-2">
                                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                            Email Authenticator
                                        </h4>
                                        <p className="text-sm opacity-60">Send a 6-digit code to your email on sign-in.</p>
                                    </div>
                                    <input type="checkbox" className="toggle toggle-primary toggle-lg" checked={email2faEnabled} onChange={toggleEmail2FA} disabled={loading} />
                                </div>
                            </div>

                            <div className="divider my-0">OR</div>

                            <div className="bg-base-200 p-6 rounded-2xl border border-base-content/10">
                                <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    App Authenticator (TOTP)
                                </h4>
                                <p className="text-sm opacity-60 mb-6">Use an app like Google Authenticator or Authy to scan a QR code.</p>

                                {!totpEnabled ? (
                                    !qrCode ? (
                                        <button className="btn btn-outline" onClick={generate2FA} disabled={loading}>Begin Setup</button>
                                    ) : (
                                        <div className="flex flex-col items-center gap-4 bg-base-100 p-6 rounded-xl border border-base-content/5">
                                            <p className="font-bold">1. Scan this QR Code with your App</p>
                                            <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 bg-white p-2 rounded-xl" />
                                            <p className="font-bold mt-4">2. Enter the 6-digit TOTP Code</p>
                                            <input type="text" placeholder="000000" className="input input-bordered text-center text-xl tracking-widest w-full max-w-xs" value={otpCode} onChange={e => setOtpCode(e.target.value)} maxLength={6} />
                                            <button className="btn btn-primary w-full max-w-xs" onClick={verify2FA} disabled={loading || otpCode.length < 6}>Verify Code & Enable</button>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex flex-col items-start gap-4">
                                        <div className="badge badge-success gap-2 p-3 font-bold">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            Currently Enabled
                                        </div>
                                        <button className="btn btn-error btn-outline btn-sm" onClick={disableTOTP} disabled={loading}>Disable Authenticator App</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <div className="divider"></div>

                    {/* Session Terminator */}
                    <section>
                        <h3 className="text-2xl font-bold text-error mb-4">Session Management</h3>
                        <p className="text-sm opacity-70 mb-4">If you left your account logged in on a public device or suspect unauthorized access, you can invalidate all active JSON Web Tokens securely. You will need to log back in immediately after completing this.</p>
                        <button className="btn btn-error btn-outline" onClick={handleTerminateSessions} disabled={loading}>Revoke Access on All Devices</button>
                    </section>

                    <div className="divider"></div>

                    {/* Account Deletion */}
                    <section>
                        <h3 className="text-2xl font-black text-error mb-4">Danger Zone</h3>
                        <p className="text-sm opacity-70 mb-4">Completely eradicate your authentication profile from the core MongoDB engines. This wipes out your global Rank, total accrued XP points, and invalidates all session contexts forever.</p>
                        <button className="btn btn-error text-error-content font-bold shadow-md pulse-error group relative overflow-hidden" onClick={handleDeleteAccount} disabled={loading}>
                            <span className="relative z-10 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                Permanent Account Deletion
                            </span>
                            <div className="absolute inset-0 bg-black/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                        </button>
                    </section>
                </div>
            )}
        </div>
    );
}
