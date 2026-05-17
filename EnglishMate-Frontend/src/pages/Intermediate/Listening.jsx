// src/pages/Intermediate/ListeningModule.jsx
import React, { useState, useEffect } from "react";
import Confetti from "canvas-confetti";
import Swal from "sweetalert2";
import { Mic, RotateCcw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function ListeningModule() {
  const { user, saveListeningProgress, fetchListeningProgress } = useAuth();

  // ===== STATES =====
  const [showVideo, setShowVideo] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [storyStep, setStoryStep] = useState(0);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [mcqFeedback, setMcqFeedback] = useState({});
  const [completion, setCompletion] = useState(0);
  const [moduleComplete, setModuleComplete] = useState(false);
  const [storyFinished, setStoryFinished] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // ===== STORY & MCQS =====
  const storySentences = [
    "I wake up at seven o'clock every morning.",
    "I have breakfast in the kitchen.",
    "Then I go to work at 9 AM.",
    "In the evening, I enjoy reading books.",
  ];

  const mcqs = [
    {
      question: "What time does the person wake up?",
      options: ["6 AM", "7 AM", "8 AM"],
      answer: "7 AM",
    },
    {
      question: "What does the person enjoy in the evening?",
      options: ["Watching TV", "Reading books", "Sleeping"],
      answer: "Reading books",
    },
  ];

  // ================================
  // LOAD PROGRESS FROM DB
  // ================================
  useEffect(() => {
    if (!user?.email) return;

    const loadProgress = async () => {
      try {
        const data = await fetchListeningProgress(
          user.email,
          "intermediate-listening"
        );
        if (data) {
          setShowVideo(data.showVideo || false);
          setVideoWatched(data.videoWatched || false);
          setStoryStep(data.storyStep || 0);
          setMcqAnswers(data.mcqAnswers || {});
          setCompletion(data.progress || 0);
          setModuleComplete(data.completed || false);
          setStoryFinished(data.storyFinished || false);
        }
      } catch (err) {
        console.error("Failed to load progress:", err);
      }
    };

    loadProgress();
  }, [user?.email]);

  // ================================
  // SAVE PROGRESS TO DB
  // ================================
  useEffect(() => {
    if (!user?.email) return;

    const saveProgress = async () => {
      try {
        await saveListeningProgress(user.email, {
          module: "intermediate-listening",
          progress: completion,
          showVideo,
          videoWatched,
          storyStep,
          mcqAnswers,
          storyFinished,
          completed: moduleComplete,
        });
      } catch (err) {
        console.error("Failed to save progress:", err);
      }
    };

    saveProgress();
  }, [
    showVideo,
    videoWatched,
    storyStep,
    mcqAnswers,
    storyFinished,
    completion,
    moduleComplete,
    user?.email,
  ]);

  // ======================
  // VIDEO COMPLETION
  // ======================
  useEffect(() => {
    if (!showVideo || videoWatched) return;

    if (!window.YT) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    }

    const interval = setInterval(() => {
      if (window.YT && window.YT.Player) {
        clearInterval(interval);

        const player = new window.YT.Player("ytplayer", {
          events: {
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                setVideoWatched(true);
                setCompletion(33);
                Swal.fire(
                  "✅ Video watched!",
                  "You can start the AI story now.",
                  "success"
                );
              }
            },
          },
        });

        return () => player.destroy();
      }
    }, 400);
  }, [showVideo, videoWatched]);

  // ======================
  // AI STORY SPEECH
  // ======================
  const playSentence = () => {
    const sentence = storySentences[storyStep];
    if (!sentence) return;

    setAiSpeaking(true);
    const utter = new SpeechSynthesisUtterance(sentence);
    utter.lang = "en-US";
    utter.onend = () => setAiSpeaking(false);
    speechSynthesis.speak(utter);
  };

  const nextSentence = () => {
    const next = storyStep + 1;
    if (next < storySentences.length) {
      setStoryStep(next);
      setCompletion(33 + Math.round(((next + 1) / storySentences.length) * 34));
      playSentence();
    } else {
      setStoryStep(storySentences.length);
      setStoryFinished(true);
      setCompletion(67);
      Swal.fire(
        "📝 Story finished!",
        "Now answer 2 questions from the story.",
        "info"
      );
    }
  };

  // ======================
  // MCQ HANDLERS
  // ======================
  const handleMCQChange = (question, value) => {
    setMcqAnswers((prev) => ({ ...prev, [question]: value }));
    const correct = mcqs.find((q) => q.question === question).answer;
    setMcqFeedback((prev) => ({
      ...prev,
      [question]: value === correct ? "✅ Correct!" : "❌ Wrong!",
    }));
  };

  const submitMCQs = () => {
    const correctCount = mcqs.filter(
      (q) => mcqAnswers[q.question] === q.answer
    ).length;

    if (correctCount === mcqs.length) {
      Confetti();
      setCompletion(100);
      setModuleComplete(true);
      Swal.fire(
        "🎉 Congratulations!",
        "You finished the Listening Module!",
        "success"
      );
    } else {
      Swal.fire(
        "⚠️ Some answers are wrong",
        "Try again to complete the module.",
        "error"
      );
    }
  };

  // ======================
  // RESTART MODULE
  // ======================
  const handleRestart = () => {
    setShowVideo(false);
    setVideoWatched(false);
    setStoryStep(0);
    setAiSpeaking(false);
    setMcqAnswers({});
    setMcqFeedback({});
    setCompletion(0);
    setModuleComplete(false);
    setStoryFinished(false);
  };

  // ======================
  // RENDER
  // ======================
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* TOP MENU */}
      <div className="flex justify-between items-center bg-teal-700 text-white p-4 rounded-lg shadow mb-4">
        <button onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        <h1 className="text-xl font-bold">Intermediate Listening Module</h1>
        <button onClick={handleRestart}>
          <RotateCcw size={20} />
        </button>
      </div>

      {menuOpen && (
        <div className="bg-white shadow p-4 rounded mb-4">
          <p className="font-semibold">Menu</p>
          <p className="text-sm text-gray-600">More options coming soon...</p>
        </div>
      )}

      {/* PROGRESS BAR */}
      <div className="bg-white p-4 rounded shadow mb-6 max-w-3xl mx-auto">
        <p className="font-semibold mb-2">Progress</p>
        <div className="bg-gray-200 h-4 rounded-full overflow-hidden">
          <div
            className="bg-teal-600 h-4 rounded-full transition-all duration-700"
            style={{ width: `${completion}%` }}
          ></div>
        </div>
        <p className="mt-1 text-sm">{completion}% completed</p>
      </div>

      {/* VIDEO */}
      {!showVideo && (
        <div className="bg-white p-6 rounded-xl shadow max-w-3xl mx-auto text-center mb-6">
          <p className="mb-4">Click to start module and watch the video</p>
          <button
            onClick={() => setShowVideo(true)}
            className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700"
          >
            ▶️ Start Module
          </button>
        </div>
      )}

      {showVideo && !videoWatched && (
        <div className="bg-white p-6 rounded-xl shadow max-w-3xl mx-auto mb-6">
          <iframe
            id="ytplayer"
            width="100%"
            height="250"
            src="https://www.youtube.com/embed/L31ExXwlsVc?enablejsapi=1"
            title="Intermediate Listening Video"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="rounded-xl"
          />
          <p className="text-sm text-gray-500 mt-1">
            ⏳ Watch full video to unlock story.
          </p>
        </div>
      )}

      {/* AI STORY */}
      {videoWatched &&
        !moduleComplete &&
        !storyFinished &&
        storyStep < storySentences.length && (
          <div className="bg-white p-6 rounded-xl shadow max-w-3xl mx-auto mb-6 text-center">
            <h2 className="text-xl font-semibold mb-4">🎧 AI Story Practice</h2>
            <p className="mb-4">{storySentences[storyStep]}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={playSentence}
                disabled={aiSpeaking}
                className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
              >
                {aiSpeaking ? "Speaking..." : "🔊 Play Sentence"}
              </button>
              <button
                onClick={nextSentence}
                className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
              >
                Next Sentence
              </button>
            </div>
          </div>
        )}

      {/* MCQS */}
      {videoWatched && storyFinished && !moduleComplete && (
        <div className="bg-white p-6 rounded-xl shadow max-w-3xl mx-auto mb-6 text-center">
          <h2 className="text-xl font-semibold mb-4">📝 Answer Questions</h2>
          {mcqs.map((q, idx) => (
            <div key={idx} className="mb-4 text-left">
              <p className="font-medium mb-2">{q.question}</p>
              {q.options.map((opt) => (
                <label key={opt} className="block cursor-pointer mb-1">
                  <input
                    type="radio"
                    name={q.question}
                    value={opt}
                    checked={mcqAnswers[q.question] === opt}
                    onChange={(e) =>
                      handleMCQChange(q.question, e.target.value)
                    }
                    className="mr-2"
                  />
                  {opt}
                </label>
              ))}
              <p className="text-sm mt-1">{mcqFeedback[q.question]}</p>
            </div>
          ))}
          <button
            onClick={submitMCQs}
            className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700"
          >
            Submit Answers
          </button>
        </div>
      )}

      {/* MODULE COMPLETE */}
      {moduleComplete && (
        <div className="bg-green-50 p-6 rounded-xl shadow max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-green-700 mb-2">
            🎉 Module Completed!
          </h2>
          <p>You finished the Listening Module. Speaking Module unlocked!</p>
        </div>
      )}
    </div>
  );
}
