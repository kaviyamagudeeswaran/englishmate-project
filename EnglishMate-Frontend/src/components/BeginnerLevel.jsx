import { useState } from "react";
import { BookOpen, Volume2, CheckCircle, Play } from "lucide-react";

export default function BeginnerLevel() {
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      id: 1,
      question: "Where does she eat lunch?",
      options: ["Office", "Cafeteria", "Home"],
      answer: "Cafeteria",
    },
    {
      id: 2,
      question: "When does she complete work?",
      options: ["5 PM", "2 PM", "8 PM"],
      answer: "2 PM",
    },
  ];

  const handleAnswerSelect = (qid, option) => {
    setSelectedAnswers((prev) => ({ ...prev, [qid]: option }));
  };

  const handleQuizSubmit = () => {
    setShowResults(true);
    const allCorrect = questions.every(
      (q) => selectedAnswers[q.id] === q.answer
    );
    if (allCorrect) setQuizCompleted(true);
  };

  const handlePracticeComplete = () => {
    setPracticeCompleted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-8">
      <h1 className="text-4xl font-bold text-center text-teal-700 mb-10">
        🎧 Beginner Level - Listening Module
      </h1>

      {/* ---- Milestone 1: Video ---- */}
      <div className="bg-white shadow-lg rounded-2xl p-6 mb-10 border-l-4 border-teal-500">
        <div className="flex items-center gap-3 mb-4">
          <Play className="text-teal-600" />
          <h2 className="text-2xl font-semibold text-gray-800">Watch Video</h2>
        </div>

        <iframe
          width="100%"
          height="360"
          src="https://www.youtube.com/embed/L31ExXwlsVc"
          title="Beginner A1-A2 Listening Practice"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-xl mb-6"
        ></iframe>

        <p className="text-gray-700 mb-4">
          🎥 <strong>About this video:</strong> This beginner-level English
          listening practice helps learners understand daily routines, places,
          and time expressions. Watch carefully and try to follow along with
          pronunciation and meaning.
        </p>

        {!videoCompleted ? (
          <button
            onClick={() => setVideoCompleted(true)}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition"
          >
            ✅ Mark as Watched
          </button>
        ) : (
          <p className="text-green-600 font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> Video Completed
          </p>
        )}
      </div>

      {/* ---- Milestone 2: MCQ ---- */}
      {videoCompleted && (
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-10 border-l-4 border-blue-500">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-800">
              MCQ Practice
            </h2>
          </div>

          {questions.map((q) => (
            <div
              key={q.id}
              className="mb-6 bg-gray-50 p-4 rounded-lg shadow-sm"
            >
              <p className="font-medium text-gray-800 mb-3">
                {q.id}. {q.question}
              </p>
              <div className="flex flex-wrap gap-3">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswerSelect(q.id, opt)}
                    className={`px-4 py-2 rounded-lg border font-medium transition ${
                      selectedAnswers[q.id] === opt
                        ? "bg-teal-600 text-white border-teal-600"
                        : "border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {!showResults ? (
            <button
              onClick={handleQuizSubmit}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Submit Answers
            </button>
          ) : quizCompleted ? (
            <p className="text-green-600 font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> All answers correct! Well
              done!
            </p>
          ) : (
            <p className="text-red-600 font-medium mt-2">
              Some answers are incorrect. Try again!
            </p>
          )}
        </div>
      )}

      {/* ---- Milestone 3: Practice ---- */}
      {quizCompleted && (
        <div className="bg-white shadow-lg rounded-2xl p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-3 mb-4">
            <Volume2 className="text-green-600" />
            <h2 className="text-2xl font-semibold text-gray-800">
              Practice Session
            </h2>
          </div>

          <div className="relative bg-sky-100 h-56 rounded-lg overflow-hidden flex justify-center items-center">
            <div className="bird-animation w-32 h-32 relative">
              <div className="bird-body bg-yellow-400 rounded-full w-20 h-20 absolute top-8 left-6 animate-bounce"></div>
              <div className="wing bg-yellow-300 w-10 h-16 rounded-full absolute top-4 left-0 animate-pulse"></div>
              <div className="beak bg-orange-500 w-6 h-3 absolute top-14 left-24 rounded-r-lg"></div>
            </div>
            <div className="absolute bottom-6 bg-white px-4 py-2 rounded-lg shadow text-gray-700 font-medium">
              🕊️ Listen and Repeat
            </div>
          </div>

          {!practiceCompleted ? (
            <button
              onClick={handlePracticeComplete}
              className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Complete Practice
            </button>
          ) : (
            <p className="text-green-600 font-semibold mt-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Practice Completed
            </p>
          )}
        </div>
      )}
    </div>
  );
}
