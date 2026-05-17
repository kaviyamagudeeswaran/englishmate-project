// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const moduleProgressSchema = new mongoose.Schema({
  moduleName: { type: String, required: true },
  progress: {
    videoWatched: { type: Boolean, default: false },
    quizUnlocked: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    practiceCompleted: { type: Boolean, default: false },
    completionPercentage: { type: Number, default: 0 },
  },
});

// Main User Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "student" },
    currentLevel: { type: String, default: "beginner" },
    goals: { type: Array, default: [] },
    preferences: { type: String, default: "" },

    // 👇 ADD THIS FOR PROGRESS STORAGE
    moduleProgress: [moduleProgressSchema],

    // Certificate unlock later
    certificateUnlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password check method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Fix overwrite model error
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
