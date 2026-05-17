// models/ListeningProgress.js
import mongoose from "mongoose";

const ListeningProgressSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    unique: true,
  },

  // Simple mode base flags
  videoWatched: {
    type: Boolean,
    default: false,
  },
  quizCompleted: {
    type: Boolean,
    default: false,
  },

  // Advanced mode state
  advancedMode: {
    type: Boolean,
    default: false,
  },
  checkpoints: {
    type: Number,
    default: 0, // more steps in advanced mode
  },

  // Final percentage
  progressPercentage: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("ListeningProgress", ListeningProgressSchema);
