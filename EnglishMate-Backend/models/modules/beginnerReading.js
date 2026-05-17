import mongoose from "mongoose";

const beginnerReadingSchema = new mongoose.Schema({
  youtubeLinks: [String],
  mcqs: [
    {
      question: String,
      options: [String],
      answer: String,
    },
  ],
});

export default mongoose.model("beginnerReading", beginnerReadingSchema);
