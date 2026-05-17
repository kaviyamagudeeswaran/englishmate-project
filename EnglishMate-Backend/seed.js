// backend/seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import ModuleContent from "./models/ModuleContent.js";

dotenv.config();
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/english_mate";

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("Connected");

  const items = [
    {
      moduleName: "listening",
      title: "Listening Module",
      video: "https://www.youtube.com/embed/L31ExXwlsVc?enablejsapi=1",
      sentences: ["I wake up at seven o'clock"],
      mcqs: [
        {
          question: "Where does she eat?",
          options: ["Cafeteria", "Room", "Garden"],
          answer: "Cafeteria",
        },
        {
          question: "What time does she finish work?",
          options: ["2 PM", "3 PM", "5 PM"],
          answer: "2 PM",
        },
      ],
    },
    {
      moduleName: "reading",
      title: "Reading Module",
      video: "https://www.youtube.com/embed/3AR98xNieJo?enablejsapi=1",
      sentences: [],
      mcqs: [
        {
          question: "What time does he wake up?",
          options: ["6 am", "7 am", "8 am"],
          answer: "7 am",
        },
        {
          question: "What does he do after school?",
          options: ["Play with friends", "Sleep", "Go shopping"],
          answer: "Play with friends",
        },
      ],
    },
    {
      moduleName: "speaking",
      title: "Speaking Module",
      video: "https://www.youtube.com/embed/-8e7iwmzgPA?enablejsapi=1",
      sentences: [],
      mcqs: [
        {
          question: "Which sentence is grammatically correct?",
          options: ["I goes to school", "I go to school", "I going school"],
          answer: "I go to school",
        },
      ],
    },
    {
      moduleName: "writing",
      title: "Writing Module",
      video: "https://www.youtube.com/embed/hAUT67_BgAc?enablejsapi=1",
      sentences: [],
      mcqs: [
        {
          question: "Which phrase is formal for starting an email?",
          options: ["Hey there!", "Dear Sir/Madam,", "Yo!"],
          answer: "Dear Sir/Madam,",
        },
      ],
      description: "Writing an email – English at Work",
    },
  ];

  for (const it of items) {
    await ModuleContent.findOneAndUpdate({ moduleName: it.moduleName }, it, {
      upsert: true,
      new: true,
    });
    console.log("Seeded:", it.moduleName);
  }

  console.log("Done");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
