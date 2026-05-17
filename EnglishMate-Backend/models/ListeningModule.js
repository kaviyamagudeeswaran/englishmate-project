import mongoose from "mongoose";

const mcqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  answer: { type: String, required: true },
});

const listeningModuleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    video: { type: String, required: true },
    sentences: { type: [String], default: [] },
    mcqs: { type: [mcqSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("ListeningModule", listeningModuleSchema);
