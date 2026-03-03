import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
    author: mongoose.Types.ObjectId;
    content: string;
    targetType: "profile" | "question";
    targetId: mongoose.Types.ObjectId;
    parentComment?: mongoose.Types.ObjectId;
    likes: mongoose.Types.ObjectId[];
    dislikes: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
    {
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true, maxlength: 1000 },
        targetType: { type: String, enum: ["profile", "question"], required: true },
        targetId: { type: Schema.Types.ObjectId, required: true },
        parentComment: { type: Schema.Types.ObjectId, ref: "Comment" },
        likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
        dislikes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true }
);

export default mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);
