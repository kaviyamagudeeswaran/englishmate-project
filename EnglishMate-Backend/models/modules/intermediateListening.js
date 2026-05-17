import mongoose from "mongoose";

const intermediateListeningSchema = new mongoose.Schema({
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
  "intermediateListening",
  intermediateListeningSchema
);
