// src/pages/beginner/ListeningModule.jsx
import React, { useState, useEffect } from "react";
import {
  Ear,
  Mic,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Menu,
} from "lucide-react";
import Confetti from "canvas-confetti";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";

export default function ListeningModule() {
  const { user, saveProgress, fetchProgress } = useAuth();

  // ===== STATES =====
  const [showVideo, setShowVideo] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [quizUnlocked, setQuizUnlocked] = useState(false);
  const [userAnswer, setUserAnswer] = useState({});
  const [mcqFeedback, setMcqFeedback] = useState({});
  const [score, setScore] = useState(null);
  const [practiceInput, setPracticeInput] = useState("");
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [progressOpen, setProgressOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const level = "beginner";
  const moduleType = "listening";

  const practiceSentences = [
    "I wake up at seven o'clock",
    "She eats breakfast at 8 AM",
    "She became curious and started searching for what it might unlock.",
    "She gently used the key to open it and found a note inside.",
    "After some time, she discovered a tiny wooden box hidden behind a tree.",
  ];

  const moduleData = {
    title: "Listening Module",
    icon: Ear,
    video: "https://www.youtube.com/embed/L31ExXwlsVc?enablejsapi=1",
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
      {
        question: "What does she do after work?",
        options: ["Yoga", "Sleep", "Read"],
        answer: "Yoga",
      },
      {
        question: "Which time does she have class?",
        options: ["Evening", "Morning", "Afternoon"],
        answer: "Evening",
      },
    ],
  };

  // ===== LOAD SAVED PROGRESS =====
  useEffect(() => {
    const loadProgress = async () => {
      if (!user?.email || !fetchProgress) return;
      try {
        const data = await fetchProgress(user.email);
        const moduleProgress = data?.find(
          (item) => item.level === level && item.moduleType === moduleType
        );

        if (moduleProgress) {
          setVideoWatched(moduleProgress.videoWatched || false);
          setQuizUnlocked(moduleProgress.quizUnlocked || false);
          setScore(moduleProgress.score || null);
          setPracticeCompleted(moduleProgress.practiceCompleted || false);
          setCompletionPercentage(moduleProgress.progress || 0);
          setCurrentSentenceIndex(moduleProgress.currentSentenceIndex || 0);
          setUserAnswer(moduleProgress.userAnswers || {});
          if (moduleProgress.showVideo) setShowVideo(true);
        }
      } catch (err) {
        console.error("Failed to load progress:", err);
      }
    };
    loadProgress();
  }, [user, fetchProgress]);

  // ===== SAVE PROGRESS =====
  useEffect(() => {
    const saveModuleProgress = async () => {
      if (!user?.email || !saveProgress) return;

      try {
        await saveProgress({
          level,
          moduleType,
          videoWatched,
          quizUnlocked,
          score,
          practiceCompleted,
          currentSentenceIndex,
          userAnswers: userAnswer,
          showVideo,
          completed: completionPercentage === 100,
          progress: completionPercentage,
        });
      } catch (err) {
        console.error("Failed to save progress:", err);
      }
    };
    saveModuleProgress();
  }, [
    videoWatched,
    quizUnlocked,
    userAnswer,
    score,
    practiceCompleted,
    currentSentenceIndex,
    showVideo,
    completionPercentage,
    user?.email,
    saveProgress,
  ]);

  // ===== YOUTUBE IFRAME API =====
  useEffect(() => {
    if (window.YT) return;
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(script);
  }, []);

  // ===== VIDEO COMPLETION =====
  useEffect(() => {
    if (!showVideo) return;

    const interval = setInterval(() => {
      if (window.YT && window.YT.Player) {
        clearInterval(interval);

        const player = new window.YT.Player("ytplayer", {
          events: {
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                setVideoWatched(true);
                setCompletionPercentage((prev) => Math.max(prev, 33));
              }
            },
          },
        });

        return () => player.destroy();
      }
    }, 400);
  }, [showVideo]);

  // ===== RESTART MODULE =====
  const handleRestart = () => {
    setShowVideo(false);
    setVideoWatched(false);
    setQuizUnlocked(false);
    setScore(null);
    setPracticeCompleted(false);
    setCompletionPercentage(0);
    setUserAnswer({});
    setMcqFeedback({});
    setCurrentSentenceIndex(0);
    setPracticeInput("");
  };

  const handleUnlockQuiz = () => {
    setQuizUnlocked(true);
    setCompletionPercentage((prev) => Math.max(prev, 50));
  };

  // ===== MCQ HANDLERS =====
  const handleMCQChange = (question, value) => {
    setUserAnswer((prev) => ({ ...prev, [question]: value }));
    const correct = moduleData.mcqs.find((q) => q.question === question).answer;
    setMcqFeedback((prev) => ({
      ...prev,
      [question]: value === correct ? "Correct!" : "Wrong!",
    }));
  };

  const handleSubmitMCQ = () => {
    let correctCount = 0;
    moduleData.mcqs.forEach((q) => {
      if (userAnswer[q.question] === q.answer) correctCount++;
    });

    setScore(correctCount);

    if (correctCount === moduleData.mcqs.length) {
      setCompletionPercentage(75);
      Confetti();
    }
  };

  // ===== PRACTICE HANDLERS =====
  const playCurrentSentence = (i) => {
    const sentence = practiceSentences[i];
    setAiSpeaking(true);
    const utter = new SpeechSynthesisUtterance(sentence);
    utter.lang = "en-US";
    utter.onend = () => setAiSpeaking(false);
    speechSynthesis.speak(utter);
  };

  const checkPractice = () => {
    const correctSentence = practiceSentences[currentSentenceIndex]
      .toLowerCase()
      .trim();
    const typed = practiceInput.toLowerCase().trim();

    if (typed === correctSentence) {
      Swal.fire({ icon: "success", title: "Correct!", timer: 1200 });
      Confetti();

      const next = currentSentenceIndex + 1;

      if (next < practiceSentences.length) {
        setCurrentSentenceIndex(next);
        setPracticeInput("");
        playCurrentSentence(next);
      } else {
        setPracticeCompleted(true);
        setCompletionPercentage(100);
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Incorrect",
        text: "Try again",
        timer: 1200,
      });
    }
  };

  // ===== RENDER =====
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* TOP MENU */}
      <div className="flex items-center justify-between bg-teal-700 text-white p-4 rounded-lg shadow">
        <button onClick={() => setMenuOpen(!menuOpen)}>
          <Menu size={28} />
        </button>
        <h1 className="text-xl font-bold">Beginner Level - Listening Module</h1>
        <div className="w-8"></div>
      </div>

      {menuOpen && (
        <div className="bg-white shadow-lg p-4 mt-2 rounded-lg">
          <p className="font-semibold">☰ Menu</p>
          <p className="text-sm text-gray-600">More options coming soon...</p>
        </div>
      )}

      {/* PROGRESS TRACKER */}
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
              ></div>
            </div>
            <p className="mt-1 text-sm">{completionPercentage}% completed</p>
          </div>
        )}

        <button
          onClick={handleRestart}
          className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition"
        >
          <RotateCcw size={18} /> Restart
        </button>
      </div>

      {/* MAIN MODULE */}
      <div className="bg-white shadow-xl rounded-2xl p-6 mt-6 mx-auto max-w-3xl">
        {!showVideo ? (
          <div className="text-center">
            <p className="text-lg mb-4">Click below to start the module.</p>
            <button
              onClick={() => setShowVideo(true)}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition"
            >
              ▶️ Start Module
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <iframe
                id="ytplayer"
                width="100%"
                height="250"
                src={moduleData.video}
                title={moduleData.title}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="rounded-xl"
              />
              {!videoWatched && (
                <p className="text-sm text-gray-500 mt-1">
                  ⏳ Watch full video to unlock quiz.
                </p>
              )}
              {videoWatched && !quizUnlocked && (
                <button
                  onClick={handleUnlockQuiz}
                  className="mt-3 bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition"
                >
                  Unlock Quiz
                </button>
              )}
            </div>

            {quizUnlocked && (
              <div className="p-4 bg-gray-50 rounded-xl shadow mb-6">
                <h3 className="font-bold text-lg mb-4">🧠 Quiz</h3>
                {moduleData.mcqs.map((q, idx) => (
                  <div key={idx} className="mb-4 p-2 border rounded">
                    <p className="font-semibold mb-2">{q.question}</p>
                    {q.options.map((opt) => (
                      <label key={opt} className="block cursor-pointer">
                        <input
                          type="radio"
                          name={q.question}
                          value={opt}
                          checked={userAnswer[q.question] === opt}
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
                        className={`mt-2 font-semibold ${
                          mcqFeedback[q.question] === "Correct!"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {mcqFeedback[q.question]}
                      </p>
                    )}
                  </div>
                ))}
                <button
                  onClick={handleSubmitMCQ}
                  className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition"
                >
                  Submit Answers
                </button>
              </div>
            )}

            {score === moduleData.mcqs.length && !practiceCompleted && (
              <div className="p-4 bg-gray-50 rounded-xl shadow">
                <h3 className="font-bold mb-2">🎧 Practice Session</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Mic
                    className={`w-6 h-6 text-teal-600 ${
                      aiSpeaking ? "animate-pulse" : ""
                    }`}
                  />
                  <button
                    onClick={() => playCurrentSentence(currentSentenceIndex)}
                    className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition"
                  >
                    🔊 Play AI Sentence
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Type what you heard..."
                  value={practiceInput}
                  onChange={(e) => setPracticeInput(e.target.value)}
                  className="w-full border px-2 py-1 rounded mb-2"
                />
                <button
                  onClick={checkPractice}
                  className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition"
                >
                  Check
                </button>
              </div>
            )}

            {practiceCompleted && (
              <div className="p-4 bg-green-50 rounded-xl shadow text-center">
                <h3 className="font-bold text-green-700 text-lg mb-2">
                  🎉 Practice Completed!
                </h3>
                <p>You’ve completed this module successfully.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
