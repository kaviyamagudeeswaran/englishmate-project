import mongoose from "mongoose";

const intermediateReadingSchema = new mongoose.Schema({
  youtubeLinks: [String],
  mcqs: [
    {
      question: String,
      options: [String],
      answer: String,
    },
  ],
});

export default mongoose.model("intermediateReading", intermediateReadingSchema);
