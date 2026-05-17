import mongoose from "mongoose";

const beginnerWritingSchema = new mongoose.Schema({
  youtubeLinks: [String],
  mcqs: [
    {
      question: String,
      options: [String],
      answer: String,
    },
  ],
});

export default mongoose.model("beginnerWriting", beginnerWritingSchema);
