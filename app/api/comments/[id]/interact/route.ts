import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Comment from "@/models/Comment";
import mongoose from "mongoose";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;
        const { action } = await req.json(); // like or dislike

        if (!mongoose.Types.ObjectId.isValid(id) || !["like", "dislike"].includes(action)) {
            return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
        }

        await dbConnect();
        const comment = await Comment.findById(id);

        if (!comment) {
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }

        const userId = session.user.id;
        const hasLiked = comment.likes.includes(userId);
        const hasDisliked = comment.dislikes.includes(userId);

        if (action === "like") {
            if (hasLiked) {
                // Remove like
                comment.likes.pull(userId);
            } else {
                comment.likes.push(userId);
                if (hasDisliked) comment.dislikes.pull(userId);
            }
        } else if (action === "dislike") {
            if (hasDisliked) {
                // Remove dislike
                comment.dislikes.pull(userId);
            } else {
                comment.dislikes.push(userId);
                if (hasLiked) comment.likes.pull(userId);
            }
        }

        await comment.save();

        return NextResponse.json({
            success: true,
            likesCount: comment.likes.length,
            dislikesCount: comment.dislikes.length,
            hasLiked: comment.likes.includes(userId),
            hasDisliked: comment.dislikes.includes(userId)
        });
    } catch (error) {
        console.error("Comment Interact Error:", error);
        return NextResponse.json({ error: "Interaction failed" }, { status: 500 });
    }
}
