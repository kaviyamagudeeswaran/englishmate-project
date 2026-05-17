import mongoose from "mongoose";

const beginnerListeningSchema = new mongoose.Schema({
  youtubeLinks: [String],
  mcqs: [
    {
      question: String,
      options: [String],
      answer: String,
    },
  ],
});

export default mongoose.model("beginnerListening", beginnerListeningSchema);
