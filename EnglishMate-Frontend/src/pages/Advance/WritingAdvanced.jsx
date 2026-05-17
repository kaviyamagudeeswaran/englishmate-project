// src/pages/Advance/WritingAdvanced.jsx
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import Confetti from "canvas-confetti";
import { useAuth } from "../../context/AuthContext";

// Example AI feedback function
async function getAIFeedback(text) {
  // Replace with real AI API call
  if (!text) return "Please write something to get feedback.";
  return `AI Feedback: Improve clarity, grammar, and vocabulary. Your text has ${
    text.split(" ").length
  } words.`;
}

export default function WritingAdvanced() {
  const { user } = useAuth();

  const [showVideo, setShowVideo] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);

  const [quizUnlocked, setQuizUnlocked] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});

  const [practiceStage, setPracticeStage] = useState(0); // 1 = paragraph, 2 = essay
  const [writingText, setWritingText] = useState("");
  const [aiFeedback, setAIFeedback] = useState("");
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const [essayTime, setEssayTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const essayTimerRef = useRef(null);

  const playerRef = useRef(null);

  const moduleMCQs = [
    {
      id: "q1",
      question: "What is the main purpose of improving writing skills?",
      options: [
        "To communicate ideas clearly",
        "To memorize grammar rules",
        "To impress teachers only",
      ],
      answer: "To communicate ideas clearly",
    },
    {
      id: "q2",
      question: "Which activity helps improve vocabulary?",
      options: ["Writing essays", "Watching movies silently", "Sleeping"],
      answer: "Writing essays",
    },
    {
      id: "q3",
      question: "How can AI feedback help writing?",
      options: [
        "Correct grammar and clarity",
        "Write essays automatically",
        "Translate into another language",
      ],
      answer: "Correct grammar and clarity",
    },
  ];

  // ---------- YouTube video setup ----------
  useEffect(() => {
    if (!showVideo) return;

    if (!window.YT) {
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(s);
    }

    window.onYouTubeIframeAPIReady = () => {
      try {
        playerRef.current = new window.YT.Player("writing-video-iframe", {
          events: {
            onStateChange: (e) => {
              if (e.data === window.YT.PlayerState.ENDED) {
                setVideoWatched(true);
                setQuizUnlocked(true);
                setCompletionPercentage(20);
              }
            },
          },
        });
      } catch (err) {
        console.warn("YT player failed:", err);
      }
    };

    if (window.YT && !playerRef.current) {
      playerRef.current = new window.YT.Player("writing-video-iframe", {
        events: {
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.ENDED) {
              setVideoWatched(true);
              setQuizUnlocked(true);
              setCompletionPercentage(20);
            }
          },
        },
      });
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy)
        playerRef.current.destroy();
    };
  }, [showVideo]);

  // ---------- Quiz handlers ----------
  function handleAnswerChange(qid, val) {
    setUserAnswers((prev) => ({ ...prev, [qid]: val }));
  }

  function submitQuiz() {
    let s = 0;
    moduleMCQs.forEach((q) => {
      if (userAnswers[q.id] === q.answer) s++;
    });
    setScore(s);
    setQuizCompleted(true);
    Confetti();

    // Unlock writing practice automatically
    setPracticeStage(1);
    setCompletionPercentage(50);
  }

  // ---------- Writing Practice ----------
  async function submitWriting() {
    const feedback = await getAIFeedback(writingText);
    setAIFeedback(feedback);

    if (practiceStage === 1) {
      setPracticeStage(2);
      setWritingText("");
      setCompletionPercentage(75);
    } else if (practiceStage === 2) {
      setCompletionPercentage(100);
      Confetti();
    }
  }

  function startEssayTimer() {
    setTimerRunning(true);
    essayTimerRef.current = setInterval(() => {
      setEssayTime((t) => t + 1);
    }, 1000);
  }

  function stopEssayTimer() {
    setTimerRunning(false);
    clearInterval(essayTimerRef.current);
  }

  // ---------- Restart Module ----------
  function restartModule() {
    setShowVideo(false);
    setVideoWatched(false);
    setQuizUnlocked(false);
    setQuizCompleted(false);
    setScore(null);
    setUserAnswers({});
    setPracticeStage(0);
    setWritingText("");
    setAIFeedback("");
    setCompletionPercentage(0);
    setEssayTime(0);
    stopEssayTimer();
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="bg-teal-700 text-white p-4 rounded-lg text-center">
        <h1 className="text-3xl font-bold">Advanced Level - Writing Module</h1>
      </header>

      {/* Progress */}
      <div className="bg-white shadow p-4 flex justify-between items-center mt-4 rounded-lg max-w-4xl mx-auto">
        <div className="w-1/2 mt-2">
          <div className="bg-gray-200 h-4 rounded-full overflow-hidden">
            <div
              className="bg-teal-600 h-4 rounded-full transition-all duration-700"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="mt-1 text-sm">{completionPercentage}% completed</p>
        </div>
        <button
          onClick={restartModule}
          className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
        >
          <RotateCcw size={18} /> Restart
        </button>
      </div>

      {/* Module */}
      <div className="bg-white shadow-xl rounded-2xl p-6 mt-6 mx-auto max-w-3xl">
        {!showVideo ? (
          <div className="text-center">
            <p className="text-lg mb-4">Click below to start the lesson.</p>
            <button
              onClick={() => setShowVideo(true)}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700"
            >
              ▶️ Start Lesson
            </button>
          </div>
        ) : (
          <>
            {/* Video */}
            <div className="mb-6">
              <iframe
                id="writing-video-iframe"
                width="100%"
                height="250"
                src={`https://www.youtube.com/embed/iXtBEzR9tSw?enablejsapi=1`}
                title="Writing lesson"
                frameBorder="0"
                allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="rounded-xl mb-2"
              />
              {!videoWatched && (
                <p className="text-sm text-gray-500">
                  ⏳ Watch the full video to unlock the quiz.
                </p>
              )}
            </div>

            {/* Quiz */}
            {quizUnlocked && !quizCompleted && (
              <div className="p-4 bg-gray-50 rounded-xl shadow mb-6">
                <h3 className="font-bold text-lg mb-4">🧠 Quiz</h3>
                {moduleMCQs.map((q) => (
                  <div key={q.id} className="mb-4 p-2 border rounded">
                    <p className="font-semibold mb-2">{q.question}</p>
                    {q.options.map((opt) => (
                      <label key={opt} className="block cursor-pointer">
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={userAnswers[q.id] === opt}
                          onChange={(e) =>
                            handleAnswerChange(q.id, e.target.value)
                          }
                          className="mr-2"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ))}
                <button
                  onClick={submitQuiz}
                  className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                >
                  Submit Answers
                </button>
              </div>
            )}

            {/* Writing Practice */}
            {quizCompleted && practiceStage >= 1 && (
              <div className="p-4 bg-gray-50 rounded-xl shadow mt-6">
                <h3 className="font-bold mb-3">✍️ Writing Practice</h3>

                {practiceStage === 1 && (
                  <>
                    <p className="mb-2">
                      1️⃣ Paragraph about your day (~100 words). Focus on
                      grammar.
                    </p>
                    <textarea
                      value={writingText}
                      onChange={(e) => setWritingText(e.target.value)}
                      className="w-full h-32 border p-2 rounded mb-3"
                      placeholder="Start writing here..."
                    />
                    <button
                      onClick={submitWriting}
                      className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                    >
                      Get AI Feedback
                    </button>
                  </>
                )}

                {practiceStage === 2 && (
                  <>
                    <p className="mb-2">
                      2️⃣ Essay writing (20–30 min). Focus on speed and clarity.
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      Timer: {Math.floor(essayTime / 60)}m {essayTime % 60}s
                    </p>
                    <textarea
                      value={writingText}
                      onChange={(e) => setWritingText(e.target.value)}
                      className="w-full h-48 border p-2 rounded mb-3"
                      placeholder="Start writing your essay..."
                    />
                    {!timerRunning && (
                      <button
                        onClick={startEssayTimer}
                        className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 mr-2"
                      >
                        Start Timer
                      </button>
                    )}
                    <button
                      onClick={submitWriting}
                      className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                    >
                      Get AI Feedback
                    </button>
                  </>
                )}

                {aiFeedback && (
                  <div className="mt-3 p-3 bg-yellow-50 border rounded">
                    <p className="font-semibold">AI Feedback:</p>
                    <p>{aiFeedback}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
