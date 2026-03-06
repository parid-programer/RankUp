import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import speakeasy from "speakeasy";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: (process.env.GOOGLE_CLIENT_ID || "mock-google-id") as string,
            clientSecret: (process.env.GOOGLE_CLIENT_SECRET || "mock-google-secret") as string,
        }),
        CredentialsProvider({
            name: "Email and Password",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                otp: { label: "2FA Code", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing credentials");
                }

                await dbConnect();
                const user = await User.findOne({ email: credentials.email });

                if (!user || !user.password) {
                    throw new Error("No user found with this email");
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error("Invalid password");
                }

                // Enforce 2FA if enabled
                if (user.twoFactorEnabled) {
                    if (!credentials.otp) {
                        throw new Error("2FA_REQUIRED");
                    }
                    const isValidToken = speakeasy.totp.verify({
                        secret: user.twoFactorSecret,
                        encoding: "base32",
                        token: credentials.otp,
                        window: 1 // 30 seconds leeway
                    });
                    if (!isValidToken) {
                        throw new Error("Invalid 2FA code");
                    }
                } else if (user.email2faEnabled) {
                    if (!credentials.otp) {
                        const emailCode = Math.floor(100000 + Math.random() * 900000).toString();
                        user.email2faSecret = emailCode;
                        await user.save();

                        // eslint-disable-next-line @typescript-eslint/no-var-requires
                        const nodemailer = require("nodemailer");
                        const transporter = nodemailer.createTransport({
                            host: process.env.SMTP_HOST || "smtp.ethereal.email",
                            port: Number(process.env.SMTP_PORT) || 587,
                            secure: process.env.SMTP_SECURE === "true",
                            auth: {
                                user: process.env.SMTP_USER,
                                pass: process.env.SMTP_PASS,
                            }
                        });

                        transporter.sendMail({
                            from: process.env.SMTP_USER || '"RankUp Platform" <noreply@rankup.com>',
                            to: user.email,
                            subject: "Your RankUp Verification Code",
                            text: `Your sign-in code is: ${emailCode}`,
                            html: `<b>Your sign-in code is:</b> <h1>${emailCode}</h1><p>This code will expire shortly.</p>`
                        }).catch(console.error);

                        throw new Error("2FA_EMAIL_REQUIRED");
                    }

                    if (credentials.otp !== user.email2faSecret) {
                        throw new Error("Invalid Email 2FA code");
                    }
                    user.email2faSecret = undefined;
                    await user.save();
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    rank: user.rank,
                    xp: user.xp,
                    bio: user.bio,
                    customStatus: user.customStatus,
                    presence: user.presence,
                    sessionVersion: user.sessionVersion,
                    email2faEnabled: user.email2faEnabled,
                    twoFactorEnabled: user.twoFactorEnabled,
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google" || account?.provider === "facebook") {
                await dbConnect();
                let dbUser = await User.findOne({ email: user.email });

                if (!dbUser) {
                    dbUser = await User.create({
                        name: user.name,
                        email: user.email,
                        image: user.image,
                    });
                }
                user.id = dbUser._id.toString();
                user.rank = dbUser.rank;
                user.xp = dbUser.xp;
                user.bio = dbUser.bio;
                user.customStatus = dbUser.customStatus;
                user.presence = dbUser.presence;
                user.sessionVersion = dbUser.sessionVersion;
                user.email2faEnabled = dbUser.email2faEnabled;
                user.twoFactorEnabled = dbUser.twoFactorEnabled;
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            // User is passed in on initial sign in
            if (user) {
                token.id = user.id;
                token.rank = user.rank as string;
                token.xp = user.xp as number;
                token.bio = user.bio as string;
                token.customStatus = user.customStatus as string;
                token.presence = user.presence as string;
                token.sessionVersion = user.sessionVersion as number;
                token.email2faEnabled = user.email2faEnabled as boolean;
                token.twoFactorEnabled = user.twoFactorEnabled as boolean;
            }

            // Sync dynamic DB fields and enforce active session validity
            if (token.id) {
                await dbConnect();
                const dbUser = await User.findById(token.id);
                if (!dbUser || dbUser.sessionVersion !== token.sessionVersion) {
                    token.error = "SessionInvalidated";
                } else {
                    token.rank = dbUser.rank;
                    token.xp = dbUser.xp;
                    token.bio = dbUser.bio;
                    token.customStatus = dbUser.customStatus;
                    token.presence = dbUser.presence;
                    token.email2faEnabled = dbUser.email2faEnabled;
                    token.twoFactorEnabled = dbUser.twoFactorEnabled;

                    if (dbUser.image && dbUser.image.startsWith("data:")) {
                        // Crucially, never pass 2MB base64 JSON directly into a secure JWT!
                        // This allows the cache to gracefully bust via Unix Timestamps whenever an update is executed upstream.
                        const v = dbUser.updatedAt ? new Date(dbUser.updatedAt).getTime() : Date.now();
                        token.image = `/api/user/avatar/${dbUser._id.toString()}?v=${v}`;
                    } else if (dbUser.image) {
                        token.image = dbUser.image;
                    }
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                if (token.error === "SessionInvalidated") {
                    (session as any).error = "SessionInvalidated";
                }

                session.user.id = token.id as string;
                session.user.rank = token.rank as string;
                session.user.xp = token.xp as number;
                session.user.bio = token.bio as string;
                session.user.image = token.image as string;
                session.user.customStatus = token.customStatus as string;
                session.user.presence = token.presence as string;
                session.user.sessionVersion = token.sessionVersion as number;
                session.user.email2faEnabled = token.email2faEnabled as boolean;
                session.user.twoFactorEnabled = token.twoFactorEnabled as boolean;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin", // Custom sign-in page we will build later
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-build",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
