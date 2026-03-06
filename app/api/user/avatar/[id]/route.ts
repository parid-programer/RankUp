import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();
        const user = await User.findById(id).select("image").lean();

        if (!user || !user.image) {
            return new NextResponse("", { status: 404 });
        }

        // If the image is a data URI, parse and serve as raw binary with correct mime-type
        if (user.image.startsWith("data:")) {
            const matches = user.image.match(/^data:(.+);base64,(.*)$/);
            if (matches && matches.length === 3) {
                const contentType = matches[1];
                const base64Data = matches[2];
                const buffer = Buffer.from(base64Data, "base64");

                return new NextResponse(buffer, {
                    status: 200,
                    headers: {
                        "Content-Type": contentType,
                        "Cache-Control": "public, max-age=604800, immutable", // Cache for 7 days
                    },
                });
            }
        }

        // If standard URL (Google OAuth) redirect it
        return NextResponse.redirect(user.image);
    } catch (error) {
        console.error("Error serving avatar:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
