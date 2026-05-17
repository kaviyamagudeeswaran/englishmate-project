import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Confetti from "canvas-confetti";
import { useAuth } from "../../context/AuthContext";

export default function WritingModule() {
  const { user, fetchModuleProgress, saveModuleProgress, resetModuleProgress } =
    useAuth();

  const [loading, setLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [quizUnlocked, setQuizUnlocked] = useState(false);
  const [userAnswer, setUserAnswer] = useState({});
  const [mcqFeedback, setMcqFeedback] = useState({});
  const [score, setScore] = useState(null);
  const [practiceInput, setPracticeInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [progressOpen, setProgressOpen] = useState(true);

  const moduleName = "writing";

  const moduleData = {
    title: "Writing Module",
    video: "https://www.youtube.com/embed/hAUT67_BgAc?enablejsapi=1",
    description:
      "Writing an email – 18 – English at Work has the words for perfect :You purchased an online course, but the login isn’t working. Write an email to support.",
    mcqs: [
      {
        question: "Which phrase is formal for starting an email?",
        options: ["Hey there!", "Dear Sir/Madam,", "Yo!"],
        answer: "Dear Sir/Madam,",
      },
      {
        question: "Which is the correct way to close an email?",
        options: ["Best regards,", "See ya!", "Catch you later,"],
        answer: "Best regards,",
      },
      {
        question: "Which is polite to request information?",
        options: [
          "Give me the report.",
          "Please provide the report.",
          "Send me report now!",
        ],
        answer: "Please provide the report.",
      },
      {
        question: "Which subject line is professional?",
        options: ["Meeting Update", "Yo, Meeting!", "Stuff about meeting"],
        answer: "Meeting Update",
      },
    ],
  };

  // ----------------------------------------
  // ✅ Load Progress from MongoDB
  // ----------------------------------------
  useEffect(() => {
    async function loadProgress() {
      if (!user?._id) return;

      const res = await fetchModuleProgress(user._id, moduleName);
      if (res?.progress) {
        setVideoWatched(res.progress.videoWatched);
        setQuizUnlocked(res.progress.quizUnlocked);
        setScore(res.progress.score);
        setPracticeCompleted(res.progress.practiceCompleted);
        setCompletionPercentage(res.progress.completionPercentage);
      }
      setLoading(false);
    }

    loadProgress();
  }, [user]);

  // ----------------------------------------
  // ✅ Save Progress to MongoDB when changed
  // ----------------------------------------
  useEffect(() => {
    if (loading) return; // Prevent overwrite on initial load
    if (!user?._id) return;

    const progressData = {
      videoWatched,
      quizUnlocked,
      score,
      practiceCompleted,
      completionPercentage,
    };

    saveModuleProgress(user._id, moduleName, progressData);
  }, [
    videoWatched,
    quizUnlocked,
    score,
    practiceCompleted,
    completionPercentage,
  ]);

  // YouTube API setup
  useEffect(() => {
    if (window.YT) return;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  }, []);

  useEffect(() => {
    if (!showVideo) return;

    const player = new window.YT.Player("ytplayer", {
      events: {
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            setVideoWatched(true);
            setCompletionPercentage(30);
          }
        },
      },
    });

    return () => player.destroy();
  }, [showVideo]);

  // Handle MCQ
  const handleMCQChange = (question, value) => {
    setUserAnswer((prev) => ({ ...prev, [question]: value }));
    const isCorrect =
      value === moduleData.mcqs.find((q) => q.question === question).answer;
    setMcqFeedback((prev) => ({
      ...prev,
      [question]: isCorrect ? "✅ Correct!" : "❌ Try again!",
    }));
  };

  const handleSubmitMCQ = () => {
    let correctCount = 0;
    moduleData.mcqs.forEach((q) => {
      if (userAnswer[q.question] === q.answer) correctCount++;
    });
    setScore(correctCount);
    if (correctCount === moduleData.mcqs.length) {
      Confetti();
      setCompletionPercentage(60);
    }
  };

  // Writing Practice
  const checkPractice = () => {
    if (practiceInput.trim().length > 10) {
      setFeedback("🎉 Excellent! Your writing is clear and correct.");
      setPracticeCompleted(true);
      setCompletionPercentage(100);
      Confetti();
    } else {
      setFeedback("📝 Try to write more completely and clearly!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="bg-teal-700 text-white p-4 rounded-lg text-center">
        <h1 className="text-3xl font-bold">
          Beginner Level - {moduleData.title}
        </h1>
      </header>

      {/* Progress Tracker */}
      <div className="bg-white shadow p-4 flex justify-between items-center mt-4 rounded-lg max-w-4xl mx-auto">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setProgressOpen(!progressOpen)}
        >
          <span className="font-semibold">Progress Tracker</span>
          {progressOpen ? <ChevronUp /> : <ChevronDown />}
        </div>

        {progressOpen && (
          <div className="w-1/2 mt-2">
            <div className="bg-gray-200 h-4 rounded-full overflow-hidden">
              <div
                className="bg-teal-600 h-4 rounded-full transition-all duration-700"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="mt-1 text-sm">{completionPercentage}% completed</p>
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="bg-white shadow-xl rounded-2xl p-6 mt-6 mx-auto max-w-3xl">
        {!showVideo ? (
          <div className="text-center">
            <p className="text-lg mb-4">Click below to start the module.</p>
            <button
              onClick={() => setShowVideo(true)}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700"
            >
              Start Module
            </button>
          </div>
        ) : (
          <>
            {/* VIDEO */}
            <iframe
              id="ytplayer"
              width="100%"
              height="250"
              src={moduleData.video}
              className="rounded-xl mb-4"
            ></iframe>

            {/* QUIZ */}
            {videoWatched && !quizUnlocked && (
              <button
                onClick={() => setQuizUnlocked(true)}
                className="bg-teal-600 text-white px-4 py-2 rounded"
              >
                Unlock Quiz
              </button>
            )}

            {quizUnlocked && (
              <div className="p-4 bg-gray-50 rounded-xl shadow mb-6">
                <h3 className="font-bold text-lg mb-4">Quiz</h3>

                {moduleData.mcqs.map((q) => (
                  <div key={q.question} className="mb-4 border p-2 rounded">
                    <p className="font-semibold">{q.question}</p>
                    {q.options.map((opt) => (
                      <label key={opt} className="block">
                        <input
                          type="radio"
                          name={q.question}
                          value={opt}
                          onChange={(e) =>
                            handleMCQChange(q.question, e.target.value)
                          }
                          className="mr-2"
                        />
                        {opt}
                      </label>
                    ))}

                    {mcqFeedback[q.question] && (
                      <p
                        className={
                          mcqFeedback[q.question].includes("Correct")
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {mcqFeedback[q.question]}
                      </p>
                    )}
                  </div>
                ))}

                <button
                  onClick={handleSubmitMCQ}
                  className="bg-teal-600 text-white px-4 py-2 rounded"
                >
                  Submit Answers
                </button>
              </div>
            )}

            {/* PRACTICE WRITING */}
            {score === moduleData.mcqs.length && (
              <div className="p-4 bg-gray-50 rounded-xl shadow">
                <h3 className="font-bold">
                  ✍️ Practice Writing :You purchased an online course, but the
                  login isn’t working. Write an email to support.
                </h3>
                <textarea
                  value={practiceInput}
                  onChange={(e) => setPracticeInput(e.target.value)}
                  className="w-full border rounded mt-2 p-2"
                  rows={5}
                  placeholder="Write a short email..."
                />
                <button
                  onClick={checkPractice}
                  className="bg-teal-600 text-white px-4 py-2 rounded mt-2"
                >
                  Check Writing
                </button>

                {feedback && (
                  <p className="text-green-700 font-bold mt-2">{feedback}</p>
                )}
              </div>
            )}

            {/* MODULE COMPLETED */}
            {practiceCompleted && (
              <div className="p-6 mt-4 bg-green-50 rounded-xl text-center">
                <h3 className="text-xl font-bold text-green-700">
                  🎉 Module Completed!
                </h3>
                <p>You have finished the Writing Module.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
