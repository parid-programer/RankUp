import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: (process.env.GOOGLE_CLIENT_ID || "mock-google-id") as string,
            clientSecret: (process.env.GOOGLE_CLIENT_SECRET || "mock-google-secret") as string,
        }),
        FacebookProvider({
            clientId: (process.env.FACEBOOK_CLIENT_ID || "mock-facebook-id") as string,
            clientSecret: (process.env.FACEBOOK_CLIENT_SECRET || "mock-facebook-secret") as string,
        }),
        CredentialsProvider({
            name: "Email and Password",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
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

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    rank: user.rank,
                    xp: user.xp,
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
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            // User is passed in on initial sign in
            if (user) {
                token.id = user.id;
                token.rank = user.rank as string;
                token.xp = user.xp as number;
            }

            // Allow manually updating token from client side
            if (trigger === "update" && session) {
                token.rank = session.rank;
                token.xp = session.xp;
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.rank = token.rank as string;
                session.user.xp = token.xp as number;
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
