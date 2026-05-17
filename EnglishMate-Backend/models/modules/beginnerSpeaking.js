import mongoose from "mongoose";

const beginnerSpeakingSchema = new mongoose.Schema({
  youtubeLinks: [String],
  mcqs: [
    {
      question: String,
      options: [String],
      answer: String,
    },
  ],
});

export default mongoose.model("beginnerSpeaking", beginnerSpeakingSchema);
