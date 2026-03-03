import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String, // Optional, for users who sign in via OAuth
        },
        image: {
            type: String, // Profile picture URL from OAuth
        },
        xp: {
            type: Number,
            default: 0,
        },
        rank: {
            type: String,
            enum: [
                "Bronze",
                "Silver",
                "Gold",
                "Platinum",
                "Diamond",
                "Master",
                "Grandmaster",
            ],
            default: "Bronze",
        },
        matchesPlayed: {
            type: Number,
            default: 0,
        },
        bio: {
            type: String,
            maxlength: 250,
            default: "",
        },
        customStatus: {
            type: String,
            maxlength: 60,
            default: "",
        },
        presence: {
            type: String,
            enum: ["online", "offline", "invisible"],
            default: "offline",
        },
        twoFactorEnabled: {
            type: Boolean,
            default: false,
        },
        twoFactorSecret: {
            type: String,
        },
        email2faEnabled: {
            type: Boolean,
            default: false,
        },
        email2faSecret: {
            type: String,
        },
        resetToken: {
            type: String,
        },
        resetTokenExpiry: {
            type: Date,
        },
        sessionVersion: {
            type: Number,
            default: 0,
        },
        dailyQuestionsCompleted: [{ type: mongoose.Schema.Types.ObjectId, ref: "QuestionRecord" }],
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
