"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type CommentAuthor = {
    _id: string;
    name: string;
    image: string;
    rank: string;
    customStatus: string;
    presence: string;
};

export type CommentType = {
    _id: string;
    author: CommentAuthor;
    content: string;
    targetType: "profile" | "question";
    targetId: string;
    parentComment?: string | null;
    likes: string[];
    dislikes: string[];
    createdAt: string;
    updatedAt: string;
};

function CommentNode({
    comment,
    allComments,
    onReply,
    depth = 0
}: {
    comment: CommentType;
    allComments: CommentType[];
    onReply: (parentId: string) => void;
    depth?: number;
}) {
    const { data: session } = useSession();
    const [likes, setLikes] = useState(comment.likes.length);
    const [dislikes, setDislikes] = useState(comment.dislikes.length);
    const currentUserId = session?.user?.id || "";
    const [hasLiked, setHasLiked] = useState(comment.likes.includes(currentUserId));
    const [hasDisliked, setHasDisliked] = useState(comment.dislikes.includes(currentUserId));

    const childComments = allComments.filter(c => c.parentComment === comment._id);

    const handleInteract = async (action: "like" | "dislike") => {
        if (!session) return alert("You must be logged in to interact.");
        try {
            const res = await fetch(`/api/comments/${comment._id}/interact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action })
            });
            const data = await res.json();
            if (data.success) {
                setLikes(data.likesCount);
                setDislikes(data.dislikesCount);
                setHasLiked(data.hasLiked);
                setHasDisliked(data.hasDisliked);
            }
        } catch (e) {
            console.error("Failed interaction", e);
        }
    };

    return (
        <div className={`flex flex-col gap-2 mt-4 ml-${depth > 0 ? '6' : '0'} border-l-2 ${depth > 0 ? "border-base-content/10 pl-4" : "border-transparent"}`}>
            <div className="flex items-start gap-3">
                <div className="avatar">
                    <div className="w-8 h-8 rounded-full ring-1 ring-primary/20 bg-base-300">
                        {comment.author.image ? (
                            <img src={comment.author.image} alt={comment.author.name} />
                        ) : (
                            <span className="flex h-full w-full items-center justify-center font-bold text-xs">{comment.author.name?.[0] || "?"}</span>
                        )}
                        {comment.author.presence === "online" && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success border border-base-100 rounded-full"></span>}
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <Link href={`/profile/${comment.author._id}`} className="font-bold hover:underline text-sm">{comment.author.name}</Link>
                        <span className="badge badge-primary badge-xs scale-75 origin-left">{comment.author.rank}</span>
                        <span className="text-xs opacity-50">{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                    </div>
                    <p className="text-sm mt-1 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                    <div className="flex items-center gap-4 mt-2">
                        <button onClick={() => handleInteract("like")} className={`flex items-center gap-1 text-xs hover:text-primary transition-colors ${hasLiked ? "text-primary font-bold" : "opacity-70"}`}>
                            ▲ {likes}
                        </button>
                        <button onClick={() => handleInteract("dislike")} className={`flex items-center gap-1 text-xs hover:text-error transition-colors ${hasDisliked ? "text-error font-bold" : "opacity-70"}`}>
                            ▼ {dislikes}
                        </button>
                        <button onClick={() => onReply(comment._id)} className="text-xs opacity-70 hover:opacity-100 transition-opacity">
                            Reply
                        </button>
                    </div>
                </div>
            </div>

            {/* Recursively render children */}
            {childComments.length > 0 && (
                <div className="mt-2">
                    {childComments.map(child => (
                        <CommentNode key={child._id} comment={child} allComments={allComments} onReply={onReply} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function CommentSection({ targetType, targetId }: { targetType: "profile" | "question"; targetId: string }) {
    const { status } = useSession();
    const [comments, setComments] = useState<CommentType[]>([]);
    const [newCommentContent, setNewCommentContent] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/comments?targetType=${targetType}&targetId=${targetId}`);
            const data = await res.json();
            if (data.comments) setComments(data.comments);
        } catch (e) {
            console.error("Failed to load comments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [targetId]);

    const handlePostComment = async () => {
        if (!newCommentContent.trim()) return;
        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetType, targetId, content: newCommentContent, parentComment: replyingTo })
            });
            const data = await res.json();
            if (data.comment) {
                setComments([data.comment, ...comments]);
                setNewCommentContent("");
                setReplyingTo(null);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Filter root level comments to start the tree
    const rootComments = comments.filter(c => !c.parentComment);

    return (
        <div className="w-full mt-8">
            <h3 className="text-xl font-bold mb-6 border-b border-base-content/10 pb-2">Discussion Thread</h3>

            {status === "authenticated" ? (
                <div className="flex flex-col gap-2 mb-8 glass-card p-4 rounded-xl border border-primary/20">
                    {replyingTo && (
                        <div className="flex items-center justify-between text-xs bg-base-300 p-2 rounded text-base-content/70">
                            <span>Replying to thread...</span>
                            <button onClick={() => setReplyingTo(null)} className="font-bold hover:text-error">Cancel</button>
                        </div>
                    )}
                    <textarea
                        className="textarea textarea-bordered w-full resize-none bg-base-200"
                        placeholder="Leave a comment..."
                        value={newCommentContent}
                        onChange={(e) => setNewCommentContent(e.target.value)}
                        rows={3}
                    />
                    <button className="btn btn-primary self-end" onClick={handlePostComment} disabled={!newCommentContent.trim()}>
                        Post Comment
                    </button>
                </div>
            ) : (
                <div className="alert bg-base-200 shadow-sm mb-8 text-sm opacity-80">
                    You must be signed in to join the discussion.
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-8"><span className="loading loading-spinner"></span></div>
            ) : rootComments.length === 0 ? (
                <p className="text-center opacity-50 py-8">No comments yet. Be the first to start the discussion!</p>
            ) : (
                <div className="flex flex-col gap-6">
                    {rootComments.map(root => (
                        <CommentNode key={root._id} comment={root} allComments={comments} onReply={(parentId) => { setReplyingTo(parentId); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
                    ))}
                </div>
            )}
        </div>
    );
}
