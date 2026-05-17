import mongoose from "mongoose";

const intermediateWritingSchema = new mongoose.Schema({
  youtubeLinks: [String],
  mcqs: [
    {
      question: String,
      options: [String],
      answer: String,
    },
  ],
});

export default mongoose.model("intermediateWriting", intermediateWritingSchema);
