import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            rank: string;
            xp: number;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        rank: string;
        xp: number;
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        id: string;
        rank: string;
        xp: number;
    }
}
