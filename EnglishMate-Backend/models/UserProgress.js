import mongoose from "mongoose";

const userProgressSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  module: {
    type: String,
    required: true,
  },
  watched: {
    type: Boolean,
    default: false,
  },
  quizScore: {
    type: Number,
    default: 0,
  },
  practiceScore: {
    type: Number,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("UserProgress", userProgressSchema);
