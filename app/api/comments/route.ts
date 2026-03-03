import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Comment from "@/models/Comment";
import mongoose from "mongoose";

// Fetch Comments for a given target
// Since we have recursive nested comments, we fetch all comments for the target and assemble the tree structure in the UI or fetch them flat and tree-ify.
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const targetType = searchParams.get("targetType");
        const targetId = searchParams.get("targetId");

        if (!targetType || !targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
            return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
        }

        await dbConnect();

        const comments = await Comment.find({ targetType, targetId })
            .populate("author", "name image rank customStatus presence")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ comments });
    } catch (error) {
        console.error("GET Comments Error:", error);
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }
}

// Create a new Comment
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { targetType, targetId, content, parentComment } = await req.json();

        if (!content || !targetType || !targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
            return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
        }

        await dbConnect();

        const newComment = await Comment.create({
            author: session.user.id,
            content,
            targetType,
            targetId,
            parentComment: parentComment || null,
            likes: [],
            dislikes: [],
        });

        // Populate author before returning so UI can instantly display it
        await newComment.populate("author", "name image rank customStatus presence");

        return NextResponse.json({ comment: newComment });
    } catch (error) {
        console.error("POST Comment Error:", error);
        return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
    }
}
