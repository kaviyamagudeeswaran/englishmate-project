// backend/models/ModuleProgress.js
import mongoose from "mongoose";

const moduleProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    moduleName: { type: String, required: true }, // "listening", "reading", "speaking", "writing"

    videoWatched: { type: Boolean, default: false },
    quizUnlocked: { type: Boolean, default: false },
    score: { type: Number, default: 0 },

    practiceCompleted: { type: Boolean, default: false },
    completionPercentage: { type: Number, default: 0 },

    currentSentenceIndex: { type: Number, default: 0 },
    userAnswers: { type: Object, default: {} },
    practiceText: { type: String, default: "" }, // for writing/speaking submissions
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

moduleProgressSchema.index({ userId: 1, moduleName: 1 }, { unique: true });

export default mongoose.model("ModuleProgress", moduleProgressSchema);
