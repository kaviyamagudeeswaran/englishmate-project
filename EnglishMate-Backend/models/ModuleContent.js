import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  answer: String,
});

const moduleContentSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    required: true,
  },
  moduleName: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  questions: [questionSchema],
});

export default mongoose.model("ModuleContent", moduleContentSchema);
