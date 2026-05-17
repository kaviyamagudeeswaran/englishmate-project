// src/pages/Advance/AdvancedLevel.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import ListeningAdvanced from "./ListeningAdvanced";
import SpeakingAdvanced from "./SpeakingAdvanced";
import ReadingAdvanced from "./ReadingAdvanced";
import WritingAdvanced from "./WritingAdvanced";

const AdvancedLevel = () => {
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState(null);

  const modules = [
    { id: "listening", title: "Listening", component: <ListeningAdvanced /> },
     { id: "speaking", title: "Speaking", component: <SpeakingAdvanced /> },
    { id: "reading", title: "Reading", component: <ReadingAdvanced /> },
    { id: "writing", title: "Writing", component: <WritingAdvanced /> },
  ];

  return (
    <div className="p-8 font-sans max-w-6xl mx-auto relative">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/dashboard")}
        className="absolute top-4 left-4 bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md hover:bg-teal-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-4xl font-bold text-teal-600 text-center mb-8">
        🌟 Advanced Level
      </h1>

      {/* Module Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
        {modules.map((mod) => (
          <button
            key={mod.id}
            onClick={() => setSelectedModule(mod.id)}
            className={`cursor-pointer p-4 rounded-2xl shadow-lg text-center transition-all transform ${
              selectedModule === mod.id
                ? "bg-teal-500 text-white scale-105"
                : "bg-white text-gray-700 hover:bg-teal-500 hover:text-white"
            }`}
          >
            <h2 className="text-lg font-semibold">{mod.title}</h2>
          </button>
        ))}
      </div>

      {/* Selected Module Display */}
      <div className="mt-6">
        {modules.map(
          (mod) =>
            selectedModule === mod.id && <div key={mod.id}>{mod.component}</div>
        )}
      </div>
    </div>
  );
};

export default AdvancedLevel;
