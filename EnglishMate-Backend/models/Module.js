import mongoose from "mongoose";

const mcqSchema = new mongoose.Schema({
  question: String,
  options: [String],
  answer: String,
});

const moduleSchema = new mongoose.Schema({
  moduleName: { type: String, required: true },
  level: { type: String, required: true },
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  mcqs: [mcqSchema],
  practiceSentences: [String],
});

export default mongoose.model("Module", moduleSchema);
