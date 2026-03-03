import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { action } = body;

        await dbConnect();
        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (action === "updateProfile") {
            const { bio, customStatus, presence, image } = body;

            if (bio !== undefined) user.bio = bio;
            if (customStatus !== undefined) user.customStatus = customStatus;
            if (["online", "offline", "invisible"].includes(presence)) {
                user.presence = presence;
            }
            if (image && typeof image === "string" && image.startsWith("data:image/")) {
                user.image = image;
            }

            await user.save();
            return NextResponse.json({ success: true });
        }

        if (action === "changePassword") {
            const { currentPassword, newPassword } = body;

            if (!user.password) {
                // User has no password (OAuth)
                if (currentPassword) {
                    return NextResponse.json({ error: "Your account uses a social login, please leave the current password blank to set a new one." }, { status: 400 });
                }
            } else {
                const isMatch = await bcrypt.compare(currentPassword, user.password);
                if (!isMatch) {
                    return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
                }
            }

            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();
            return NextResponse.json({ success: true, message: "Password updated successfully." });
        }

        if (action === "terminateSessions") {
            user.sessionVersion += 1;
            await user.save();
            return NextResponse.json({ success: true, message: "All sessions invalidating..." });
        }

        if (action === "toggleEmail2FA") {
            const { enabled } = body;
            user.email2faEnabled = enabled;
            await user.save();
            return NextResponse.json({ success: true, message: `Email 2FA ${enabled ? 'enabled' : 'disabled'}` });
        }

        if (action === "disableTOTP") {
            user.twoFactorEnabled = false;
            user.twoFactorSecret = undefined;
            await user.save();
            return NextResponse.json({ success: true, message: "Authenticator App disabled." });
        }

        if (action === "deleteAccount") {
            await User.findByIdAndDelete(session.user.id);
            return NextResponse.json({ success: true, message: "Account deleted successfully" });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Settings Update Error:", error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
