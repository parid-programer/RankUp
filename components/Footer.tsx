import Link from "next/link";
import { BoltIcon } from "@/app/icons";

export default function Footer() {
    return (
        <footer className="footer bg-base-200 text-base-content p-10 mt-20 border-t border-base-content/5">
            <aside>
                <div className="flex items-center gap-2 mb-2">
                    <BoltIcon className="h-6 w-6 text-primary" />
                    <span className="text-lg font-bold tracking-tight">RankUp</span>
                </div>
                <p>
                    RankUp Gamified Testing Ltd.
                    <br />
                    Proving global knowledge since 2026.
                    <br />
                    Made by Parid Haxholli, Rion Jashari and Ensar Dragusha
                </p>
            </aside>
            <nav>
                <h6 className="footer-title">Platform</h6>
                <Link href="/test" className="link link-hover">Take a Test</Link>
                <Link href="/leaderboard" className="link link-hover">Leaderboard</Link>
                <Link href="/#ranks" className="link link-hover">Rank Tiers</Link>
            </nav>
            <nav>
                <h6 className="footer-title">Company</h6>
                <Link href="/about" className="link link-hover">About Us</Link>
                <Link href="/contact" className="link link-hover">Contact</Link>
                <Link href="/reviews" className="link link-hover">Reviews</Link>
            </nav>
            <nav>
                <h6 className="footer-title">Legal</h6>
                <Link href="/terms-of-use" className="link link-hover">Terms of use</Link>
                <Link href="/privacy-policy" className="link link-hover">Privacy policy</Link>
            </nav>
        </footer>
    );
}
