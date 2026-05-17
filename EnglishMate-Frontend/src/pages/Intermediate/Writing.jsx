import React, { useState } from "react";
import { motion } from "framer-motion";

const Writing = () => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [journal, setJournal] = useState("");
  const [grammarFeedback, setGrammarFeedback] = useState("");
  const [score, setScore] = useState(null);

  const handleNext = () => {
    if (step === 3 && journal.trim().split(" ").length < 50) {
      alert("✍️ Please write at least 50 words before continuing!");
      return;
    }
    setStep((prev) => Math.min(prev + 1, 5));
  };
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  // ✅ Simple Grammar Checker
  const checkGrammar = (text) => {
    if (!text.trim()) return "Please write something to analyze.";
    let feedback = [];
    if (text.includes("I has"))
      feedback.push("❌ 'I has' → should be 'I have'");
    if (!/[.?!]/.test(text))
      feedback.push("📘 Add punctuation at the end of sentences.");
    if (text.split(" ").length < 50)
      feedback.push("✍️ Your response seems short. Try writing more!");
    if (feedback.length === 0)
      feedback.push("✅ Excellent! Your grammar looks great!");
    return feedback.join("\n");
  };

  const handleGrammarCheck = () => {
    const feedback = checkGrammar(journal);
    setGrammarFeedback(feedback);
  };

  // ✅ MCQ Quiz Data
  const mcqQuestions = [
    {
      question: "1️⃣ What is the main topic of the Oxford Online English video?",
      options: [
        "A. Writing essays and stories",
        "B. Pronunciation improvement",
        "C. Business vocabulary",
        "D. Listening comprehension",
      ],
      answer: "A",
    },
    {
      question: "2️⃣ What is one recommended writing practice?",
      options: [
        "A. Memorizing sentences",
        "B. Writing daily journals",
        "C. Avoiding grammar rules",
        "D. Only reading books",
      ],
      answer: "B",
    },
    {
      question: "3️⃣ Why is organizing ideas important in writing?",
      options: [
        "A. To make writing clearer and structured",
        "B. To make sentences shorter",
        "C. To use fewer punctuation marks",
        "D. To confuse the reader",
      ],
      answer: "A",
    },
  ];

  const handleMCQ = (index, option) => {
    setAnswers((prev) => ({ ...prev, [index]: option }));
  };

  const calculateScore = () => {
    let correct = 0;
    mcqQuestions.forEach((q, i) => {
      if (answers[i] && answers[i].startsWith(q.answer)) correct++;
    });
    setScore(`${correct}/${mcqQuestions.length}`);
  };

  // ✅ Step 1: Video
  const Step1 = () => (
    <motion.div
      className="p-6 bg-white rounded-xl shadow-lg w-[90%] mx-auto text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-2xl font-bold mb-3">🎬 Step 1: Watch Video</h2>
      <iframe
        width="100%"
        height="315"
        src="https://www.youtube.com/embed/TAbNTFT0wcU"
        title="Oxford Online English Writing Practice"
        frameBorder="0"
        allowFullScreen
      ></iframe>
      <p className="mt-3 text-gray-700">
        Watch carefully and note down how to organize your writing clearly.
      </p>
    </motion.div>
  );

  // ✅ Step 2: Quiz
  const Step2 = () => (
    <motion.div
      className="p-6 bg-white rounded-xl shadow-lg w-[90%] mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-2xl font-bold mb-3 text-center">
        🧩 Step 2: Quick Quiz
      </h2>
      {mcqQuestions.map((q, i) => (
        <div key={i} className="my-4 border p-4 rounded-lg">
          <p className="font-semibold mb-2">{q.question}</p>
          {q.options.map((opt) => (
            <label key={opt} className="block cursor-pointer">
              <input
                type="radio"
                name={`q${i}`}
                value={opt}
                checked={answers[i] === opt}
                onChange={() => handleMCQ(i, opt)}
              />
              <span className="ml-2">{opt}</span>
            </label>
          ))}
        </div>
      ))}
      <div className="text-center mt-4">
        <button
          onClick={calculateScore}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg"
        >
          ✅ Submit Quiz
        </button>
        {score && (
          <p className="mt-3 font-semibold text-teal-600 text-lg">
            Your Score: {score}
          </p>
        )}
      </div>
    </motion.div>
  );

  // ✅ Step 3: Writing Practice
  const Step3 = () => (
    <motion.div
      className="p-6 bg-white rounded-xl shadow-lg w-[90%] mx-auto text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-2xl font-bold mb-3">✍️ Step 3: Writing Practice</h2>
      <p className="text-gray-700 mb-3">
        Write at least <b>50 words</b> on this topic:
      </p>
      <div className="bg-gray-100 p-3 rounded-lg mb-3">
        <p>
          <b>Topic:</b> Describe a memorable day from your school or college
          life.
        </p>
      </div>
      <textarea
        rows="8"
        className="w-full border rounded-lg p-3"
        placeholder="Write your response here..."
        value={journal}
        onChange={(e) => setJournal(e.target.value)}
      ></textarea>
      <p className="text-sm mt-2 text-gray-500">
        Word count: {journal.trim().split(" ").filter(Boolean).length} / 50
      </p>
    </motion.div>
  );

  // ✅ Step 4: Grammar Check
  const Step4 = () => (
    <motion.div
      className="p-6 bg-white rounded-xl shadow-lg w-[90%] mx-auto text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-2xl font-bold mb-3">🧠 Step 4: Grammar & Feedback</h2>
      <p className="text-gray-700 mb-3">
        Click below to analyze your writing and get instant feedback.
      </p>
      <button
        onClick={handleGrammarCheck}
        className="px-4 py-2 bg-teal-600 text-white rounded-lg"
      >
        ✅ Check Grammar
      </button>
      {grammarFeedback && (
        <pre className="bg-gray-100 mt-4 p-3 rounded-lg text-left text-gray-800 whitespace-pre-wrap">
          {grammarFeedback}
        </pre>
      )}
    </motion.div>
  );

  // ✅ Step 5: Completion
  const Step5 = () => (
    <motion.div
      className="p-6 bg-teal-100 rounded-xl shadow-lg w-[90%] mx-auto text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-3xl font-bold mb-3">🎉 Congratulations!</h2>
      <p className="text-lg text-gray-700">
        You’ve successfully completed the <b>Writing Module</b>! Keep journaling
        daily to improve clarity and grammar.
      </p>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 flex flex-col justify-between p-6">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg"
          disabled={step === 1}
        >
          ⬅ Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          ✍️ Intermediate Writing Practice
        </h1>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg"
          disabled={step === 5}
        >
          Next ➡
        </button>
      </div>

      <div className="flex-grow flex justify-center items-center overflow-hidden">
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}
        {step === 4 && <Step4 />}
        {step === 5 && <Step5 />}
      </div>
    </div>
  );
};

export default Writing;
