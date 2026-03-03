import "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            rank: string;
            xp: number;
            bio: string;
            customStatus: string;
            presence: string;
            sessionVersion: number;
            email2faEnabled: boolean;
            twoFactorEnabled: boolean;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        }
    }

    interface User {
        id: string;
        rank?: string;
        xp?: number;
        bio?: string;
        customStatus?: string;
        presence?: string;
        sessionVersion?: number;
        email2faEnabled?: boolean;
        twoFactorEnabled?: boolean;
    }
}
