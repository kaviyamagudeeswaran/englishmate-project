import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    role: { type: String, default: "" },
    currentLevel: { type: String, default: "" },
    goals: { type: [String], default: [] },
    preferences: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);
