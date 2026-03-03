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
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
