import mongoose from "mongoose";
import beginnerListening from "./models/modules/beginnerListening.js";
import beginnerSpeaking from "./models/modules/beginnerSpeaking.js";
import beginnerReading from "./models/modules/beginnerReading.js";
import beginnerWriting from "./models/modules/beginnerWriting.js";

import intermediateListening from "./models/modules/intermediateListening.js";
import intermediateSpeaking from "./models/modules/intermediateSpeaking.js";
import intermediateReading from "./models/modules/intermediateReading.js";
import intermediateWriting from "./models/modules/intermediateWriting.js";

const MONGO_URI = "mongodb://127.0.0.1:27017/englishmate";

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    await beginnerListening.deleteMany();
    await beginnerListening.insertMany([
      {
        youtubeLinks: ["https://www.youtube.com/watch?v=HXLzYtLgk1A"],
        mcqs: [
          {
            question: "What is the topic of the video?",
            options: ["Travel", "Speaking Skills", "Grammar"],
            answer: "Speaking Skills",
          },
        ],
      },
    ]);

    await beginnerSpeaking.deleteMany();
    await beginnerSpeaking.insertMany([
      {
        youtubeLinks: ["https://youtube.com/..."],
        mcqs: [],
      },
    ]);

    await beginnerReading.deleteMany();
    await beginnerReading.insertMany([
      {
        youtubeLinks: [],
        mcqs: [],
      },
    ]);

    await beginnerWriting.deleteMany();
    await beginnerWriting.insertMany([
      {
        youtubeLinks: [],
        mcqs: [],
      },
    ]);

    // Intermediate Section
    await intermediateListening.deleteMany();
    await intermediateListening.insertMany([
      {
        youtubeLinks: ["https://youtube.com/..."],
        mcqs: [],
      },
    ]);

    await intermediateSpeaking.deleteMany();
    await intermediateSpeaking.insertMany([
      {
        youtubeLinks: [],
        mcqs: [],
      },
    ]);

    await intermediateReading.deleteMany();
    await intermediateReading.insertMany([
      {
        youtubeLinks: [],
        mcqs: [],
      },
    ]);

    await intermediateWriting.deleteMany();
    await intermediateWriting.insertMany([
      {
        youtubeLinks: [],
        mcqs: [],
      },
    ]);

    console.log("Data Seeded Successfully");
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

seed();
