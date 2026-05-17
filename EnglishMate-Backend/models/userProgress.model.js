import mongoose from "mongoose";

const userProgressSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  module: {
    type: String,
    required: true, // listening | speaking | reading | writing
  },
  videoWatched: {
    type: Boolean,
    default: false,
  },
  quizScore: {
    type: Number,
    default: 0,
  },
  practiceCompleted: {
    type: Boolean,
    default: false,
  },
  isModuleFinished: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("UserProgress", userProgressSchema);
