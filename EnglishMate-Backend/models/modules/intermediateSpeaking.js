import mongoose from "mongoose";

const intermediateSpeakingSchema = new mongoose.Schema({
  youtubeLinks: [String],
  mcqs: [
    {
      question: String,
      options: [String],
      answer: String,
    },
  ],
});

export default mongoose.model(
  "intermediateSpeaking",
  intermediateSpeakingSchema
);
