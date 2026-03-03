import mongoose, { Schema, Document } from "mongoose";

export interface IQuestionRecord extends Document {
    text: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
    difficulty: number;
    isDaily: boolean;
    activeDate?: Date;
    createdAt: Date;
}

const QuestionRecordSchema = new Schema<IQuestionRecord>(
    {
        text: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswerIndex: { type: Number, required: true },
        explanation: { type: String, required: true },
        difficulty: { type: Number, required: true, min: 1, max: 10 },
        isDaily: { type: Boolean, default: false },
        activeDate: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.models.QuestionRecord || mongoose.model<IQuestionRecord>("QuestionRecord", QuestionRecordSchema);
