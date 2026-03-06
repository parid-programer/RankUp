"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { BoltIcon } from "@/app/icons";

export default function Navbar() {
    const { data: session, status } = useSession();

    return (
        <nav className="navbar sticky top-0 z-50 glass-card px-6 lg:px-12 backdrop-blur-md bg-base-100/30 border-b border-base-content/5">
            <div className="flex-1 gap-2">
                <Link href="/" className="flex items-center gap-2">
                    <BoltIcon className="h-7 w-7 text-primary" />
                    <span className="text-xl font-bold tracking-tight gradient-text">
                        RankUp
                    </span>
                </Link>
            </div>
            <div className="flex-none gap-3">
                <div className="dropdown dropdown-end md:hidden">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-base-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                    </div>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-200 rounded-box z-[1] mt-3 w-52 p-2 shadow border border-base-content/10">
                        <li><Link href="/daily">Daily Challenge</Link></li>
                        <li><Link href="/archive">Archive</Link></li>
                        <li><Link href="/leaderboard">Leaderboard</Link></li>
                        <li><Link href="/about">About</Link></li>
                    </ul>
                </div>

                <Link href="/daily" className="btn btn-primary btn-sm hidden md:inline-flex text-primary-content tracking-wide shadow-sm pulse-glow">
                    Daily Challenge
                </Link>
                <Link href="/archive" className="btn btn-ghost btn-sm hidden md:inline-flex">
                    Archive
                </Link>
                <Link
                    href="/leaderboard"
                    className="btn btn-ghost btn-sm hidden sm:inline-flex"
                >
                    Leaderboard
                </Link>
                <Link href="/about" className="btn btn-ghost btn-sm hidden sm:inline-flex">
                    About
                </Link>

                {status === "loading" ? (
                    <div className="skeleton w-20 h-8 rounded-lg"></div>
                ) : session ? (
                    <div className="dropdown dropdown-end">
                        <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-ghost btn-circle avatar border border-primary/20"
                        >
                            <div className="w-9 rounded-full">
                                {session.user?.image ? (
                                    <img
                                        alt="User avatar"
                                        src={session.user.image}
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="bg-primary/20 text-primary w-full h-full flex items-center justify-center font-bold">
                                        {session.user?.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                )}
                            </div>
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content bg-base-200 rounded-box z-[1] mt-3 w-52 p-2 shadow border border-base-content/10"
                        >
                            <li className="px-4 py-2 opacity-50 text-xs">
                                Signed in as <br />
                                <span className="font-bold opacity-100">
                                    {session.user?.email}
                                </span>
                            </li>
                            <div className="divider my-0"></div>
                            <li>
                                <Link href="/profile" className="justify-between">
                                    Profile
                                    <span className="badge badge-primary badge-sm">
                                        {session.user?.rank || "Bronze"}
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/settings">Settings</Link>
                            </li>
                            <li>
                                <button onClick={() => signOut()}>Logout</button>
                            </li>
                        </ul>
                    </div>
                ) : (
                    <button onClick={() => signIn()} className="btn btn-primary btn-sm">
                        Sign In
                    </button>
                )}
            </div>
        </nav>
    );
}
