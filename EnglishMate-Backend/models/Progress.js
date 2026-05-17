// models/Progress.js
import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advance"],
      required: true,
    },
    moduleType: {
      type: String,
      enum: ["listening", "reading", "writing", "speaking"],
      required: true,
    },
    watched: { type: Boolean, default: false },
    quizScore: { type: Number, default: 0 },
    practiceScore: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Progress =
  mongoose.models.Progress || mongoose.model("Progress", progressSchema);
export default Progress;
