import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import ListeningModule from "./ListeningModule";
import SpeakingModule from "./SpeakingModule";
import ReadingModule from "./ReadingModule";
import WritingModule from "./WritingModule";
// import FinalCertificate from "./FinalCertificate";

const BeginnerLevel = () => {
  const [selectedModule, setSelectedModule] = useState(null);
  const navigate = useNavigate();

  const modules = [
    { id: "listening", title: "Listening" },
    { id: "speaking", title: "Speaking" },
    { id: "reading", title: "Reading" },
    { id: "writing", title: "Writing" },
    // { id: "certificate", title: "Certificate" },
  ];

  return (
    <div className="p-6 font-sans max-w-6xl mx-auto relative">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/profile-setup")}
        className="absolute top-4 left-4 bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md hover:bg-teal-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-4xl font-bold text-teal-600 text-center mb-8">
        🌱 Beginner Level
      </h1>

      {/* Module Selection */}
      <div className="flex justify-center gap-6 mb-10 flex-wrap">
        {modules.map((mod) => (
          <div
            key={mod.id}
            onClick={() => setSelectedModule(mod.id)}
            className={`cursor-pointer p-6 w-56 text-center rounded-2xl shadow-lg transition-all transform hover:scale-105 ${
              selectedModule === mod.id
                ? "bg-teal-500 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            <h2 className="text-xl font-semibold">{mod.title}</h2>
          </div>
        ))}
      </div>

      {/* Show Selected Module */}
      {selectedModule === "listening" && <ListeningModule />}
      {selectedModule === "speaking" && <SpeakingModule />}
      {selectedModule === "reading" && <ReadingModule />}
      {selectedModule === "writing" && <WritingModule />}
      {selectedModule === "certificate" && <FinalCertificate />}
    </div>
  );
};

export default BeginnerLevel;
