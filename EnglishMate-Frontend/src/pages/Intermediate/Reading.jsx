import React, { useState } from "react";
import { motion } from "framer-motion";

const Reading = () => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [reorderAnswer, setReorderAnswer] = useState("");
  const [reorderFeedback, setReorderFeedback] = useState("");

  // 🔹 Passage
  const passage = `In the early 20th century, cities began to grow rapidly as more people moved from rural areas to find work. 
Factories provided jobs but also caused pollution and crowding. 
Public transportation became essential for city life, connecting workers with their jobs and families with markets. 
As cities expanded, new challenges like housing shortages and health issues emerged, pushing governments to improve urban planning.`;

  // 🔹 MCQ Questions related to passage
  const mcqQuestions = [
    {
      question: "1️⃣ Why did cities grow rapidly in the early 20th century?",
      options: [
        "A. People moved to enjoy clean air.",
        "B. More people moved from rural areas to find jobs.",
        "C. Factories moved to villages.",
        "D. Governments encouraged migration for farming.",
      ],
      answer: "B",
    },
    {
      question: "2️⃣ What problem came with urban growth?",
      options: [
        "A. Lack of public transportation",
        "B. Too many parks and open spaces",
        "C. Pollution and crowding",
        "D. Too few job opportunities",
      ],
      answer: "C",
    },
    {
      question: "3️⃣ What did governments do as a response to new challenges?",
      options: [
        "A. Closed factories",
        "B. Encouraged migration back to villages",
        "C. Improved urban planning",
        "D. Built new farmlands",
      ],
      answer: "C",
    },
  ];

  // 🔹 Reorder sentences
  const reorderSentences = [
    "Public transport became important for connecting people to work and markets.",
    "Factories created job opportunities but increased pollution.",
    "Cities began to expand quickly as people moved from villages for work.",
    "Governments later introduced better planning to solve housing and health issues.",
  ];
  const correctOrder = [3, 2, 1, 4];

  // Handlers
  const handleMCQChange = (i, opt) => {
    setAnswers((prev) => ({ ...prev, [i]: opt }));
  };

  const handleMCQSubmit = () => {
    let correctCount = 0;
    mcqQuestions.forEach((q, i) => {
      if (answers[i] === q.answer) correctCount++;
    });
    setScore(`${correctCount}/${mcqQuestions.length}`);
  };

  const handleReorderSubmit = () => {
    const userOrder = reorderAnswer
      .split(",")
      .map((n) => parseInt(n.trim(), 10));
    if (JSON.stringify(userOrder) === JSON.stringify(correctOrder)) {
      setReorderFeedback(
        "✅ Correct! You've arranged the sentences perfectly."
      );
    } else {
      setReorderFeedback(
        "❌ Try again. Hint: Think about time sequence — what happened first?"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-green-50 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-teal-700 mb-6">
        📖 Intermediate Reading Practice
      </h1>

      <div className="w-full max-w-4xl">
        {/* Step navigation cards */}
        <div className="flex overflow-x-auto space-x-4 mb-6">
          {[1, 2, 3, 4].map((n) => (
            <motion.div
              key={n}
              className={`flex-shrink-0 w-72 bg-white rounded-xl shadow-lg p-4 ${
                step === n
                  ? "border-4 border-teal-500"
                  : "border border-gray-200"
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 * n }}
            >
              <p className="font-semibold text-lg">Step {n}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Step 1 – Watch Video */}
          {step === 1 && (
            <>
              {/* <h2 className="text-2xl font-bold mb-3"> */}
                Step 1 – Watch the Lesson
              {/* </h2> */}
              <iframe
                width="100%"
                height="300"
                src="https://www.youtube.com/embed/9xziFQZuGuY"
                title="C1 Reading Lesson"
                frameBorder="0"
                allowFullScreen
                className="rounded-lg mb-4"
              ></iframe>
              <p className="text-gray-700">
                Watch this reading lesson by Oxford Online English. It teaches
                how to think critically while reading and answer comprehension
                questions effectively.
              </p>
            </>
          )}

          {/* Step 2 – Passage + MCQs */}
          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold mb-3">
                Step 2 – Read the Passage
              </h2>
              <div className="bg-gray-100 p-4 rounded-lg mb-4 shadow-sm">
                <p className="italic text-gray-800 leading-relaxed">
                  {passage}
                </p>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Answer the Questions:
              </h3>
              {mcqQuestions.map((q, i) => (
                <div key={i} className="mb-4">
                  <p className="font-semibold mb-2">{q.question}</p>
                  {q.options.map((opt) => (
                    <label key={opt} className="block cursor-pointer mb-1">
                      <input
                        type="radio"
                        name={`q${i}`}
                        value={opt}
                        checked={answers[i] === opt}
                        onChange={() => handleMCQChange(i, opt)}
                        className="mr-2"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              ))}
              <button
                onClick={handleMCQSubmit}
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg"
              >
                Submit Answers
              </button>
              {score && (
                <p className="mt-3 font-semibold text-teal-700">
                  You scored: {score}
                </p>
              )}
            </>
          )}

          {/* Step 3 – Reorder Sentences */}
          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold mb-3">
                Step 3 – Rearrange the Sentences
              </h2>
              <p className="text-gray-700 mb-2">
                Arrange these sentences to form a logical paragraph. Type the
                correct order as numbers (e.g., 3,2,1,4).
              </p>
              <div className="bg-gray-100 p-4 rounded-lg mb-4 shadow-sm">
                {reorderSentences.map((s, i) => (
                  <p key={i} className="mb-2">
                    <strong>{i + 1}.</strong> {s}
                  </p>
                ))}
              </div>
              <input
                type="text"
                placeholder="Enter order (e.g., 3,2,1,4)"
                className="w-full border border-gray-300 rounded-lg p-2"
                value={reorderAnswer}
                onChange={(e) => setReorderAnswer(e.target.value)}
              />
              <button
                onClick={handleReorderSubmit}
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg"
              >
                Check Order
              </button>
              {reorderFeedback && (
                <p className="mt-4 font-semibold text-gray-700">
                  {reorderFeedback}
                </p>
              )}
            </>
          )}

          {/* Step 4 – Completion */}
          {step === 4 && (
            <>
              <h2 className="text-3xl font-bold mb-3 text-center text-teal-700">
                🎉 Module Completed!
              </h2>
              <p className="text-gray-700 text-center">
                Great work! You’ve improved your comprehension and logical
                ordering skills.
              </p>
            </>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep((s) => Math.max(s - 1, 1))}
            className={`px-4 py-2 rounded-lg ${
              step === 1
                ? "bg-gray-300 text-gray-600"
                : "bg-teal-500 text-white hover:bg-teal-600"
            }`}
            disabled={step === 1}
          >
            ⬅ Back
          </button>
          <button
            onClick={() => setStep((s) => Math.min(s + 1, 4))}
            className={`px-4 py-2 rounded-lg ${
              step === 4
                ? "bg-gray-300 text-gray-600"
                : "bg-teal-500 text-white hover:bg-teal-600"
            }`}
            disabled={step === 4}
          >
            Next ➡
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reading;
