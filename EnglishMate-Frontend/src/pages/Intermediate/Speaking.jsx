// src/pages/Intermediate/Speaking.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import confetti from "canvas-confetti";
import { ArrowRight, ArrowLeft, Mic } from "lucide-react";

export default function Speaking({ userEmail = null }) {
  const [step, setStep] = useState(1); // 1: Video, 2: Practice, 3: MCQ, 4: Completion
  const [videoWatched, setVideoWatched] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizFeedback, setQuizFeedback] = useState({});
  const [score, setScore] = useState(null);
  const [recording, setRecording] = useState(false);
  const [userSpeech, setUserSpeech] = useState("");
  const [conversationStep, setConversationStep] = useState(0);
  const [completion, setCompletion] = useState(0);

  const ytPlayerRef = useRef(null);
  const ytContainerId = "speaking-yt-player";

  const moduleKey = "intermediate-speaking";

  const moduleData = {
    title: "Speaking — Real Conversation Practice",
    videoId: "EdeZp0n0JHw",
    mcqs: [
      {
        question: "Which method improves spoken English fastest?",
        options: ["Reading books", "Speaking practice", "Watching movies only"],
        answer: "Speaking practice",
      },
      {
        question: "Why is pronunciation important?",
        options: [
          "It makes speech clearer",
          "It’s only useful for singers",
          "It doesn’t matter",
        ],
        answer: "It makes speech clearer",
      },
    ],
    practice: [
      { q: "👩 Hi! How are you today?", a: "I'm doing great" },
      {
        q: "🧑‍💼 What do you usually do on weekends?",
        a: "I like to meet my friends",
      },
      {
        q: "👩 That’s nice! What kind of movies do you enjoy?",
        a: "I enjoy watching comedies",
      },
    ],
  };

  // Load saved progress (optional)
  useEffect(() => {
    if (!userEmail) return;
    axios
      .get(
        `http://localhost:5000/api/progress/${encodeURIComponent(
          userEmail
        )}/${moduleKey}`
      )
      .then((res) => {
        const data = res.data || {};
        if (data.progress) setCompletion(data.progress);
        if (data.completed) setCompletion(100);
      })
      .catch(() => {});
  }, [userEmail]);

  // Save progress
  useEffect(() => {
    if (!userEmail) return;
    const save = async () => {
      try {
        await axios.post("http://localhost:5000/api/userProgress/save", {
          userEmail,
          module: moduleKey,
          progress: completion,
          completed: completion === 100,
        });
      } catch {}
    };
    save();
  }, [completion, userEmail]);

  // YouTube API setup
  useEffect(() => {
    if (window.YT) return;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  }, []);

  useEffect(() => {
    if (step !== 1) return;
    const initPlayer = () => {
      if (!window.YT || ytPlayerRef.current) return;
      ytPlayerRef.current = new window.YT.Player(ytContainerId, {
        videoId: moduleData.videoId,
        playerVars: { rel: 0, modestbranding: 1, enablejsapi: 1 },
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              setVideoWatched(true);
              setCompletion(30);
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
        try {
          ytPlayerRef.current.destroy();
        } catch {}
        ytPlayerRef.current = null;
      }
    };
  }, [step]);

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // Quiz logic
  const handleAnswer = (question, value) => {
    setQuizAnswers((prev) => ({ ...prev, [question]: value }));
    const correct = moduleData.mcqs.find((q) => q.question === question).answer;
    setQuizFeedback((prev) => ({
      ...prev,
      [question]: value === correct ? "✅ Correct!" : "❌ Try again!",
    }));
  };

  const submitQuiz = () => {
    const correctCount = moduleData.mcqs.filter(
      (q) => quizAnswers[q.question] === q.answer
    ).length;
    setScore(correctCount);
    if (correctCount === moduleData.mcqs.length) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setCompletion(100);
      setStep(4); // go to completion
    } else {
      alert(
        `You scored ${correctCount}/${moduleData.mcqs.length}. Try remaining questions.`
      );
    }
  };

  // Speech recognition
  const playPracticeSentence = () => {
    const sentence = moduleData.practice[conversationStep]?.q;
    if (!sentence) return;
    const u = new SpeechSynthesisUtterance(sentence);
    u.lang = "en-US";
    speechSynthesis.speak(u);
  };

  const startSpeechRecognition = (expectedAnswer) => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      alert("Speech recognition not supported in this browser. Try Chrome.");
      return;
    }

    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Rec();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setRecording(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserSpeech(transcript);
      setRecording(false);

      const similarity = compareStrings(expectedAnswer, transcript);
      if (similarity >= 0.7) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        setConversationStep((s) => {
          const next = s + 1;
          if (next >= moduleData.practice.length) {
            setStep(3); // unlock MCQs
            setCompletion(80);
          }
          return next;
        });
      } else {
        alert("🗣️ Try again!");
      }
    };

    recognition.onerror = () => {
      setRecording(false);
      alert("Speech recognition error. Please try again.");
    };
    recognition.onend = () => setRecording(false);

    try {
      recognition.start();
    } catch (err) {
      setRecording(false);
      alert("Speech recognition failed to start.");
    }
  };

  const compareStrings = (a, b) => {
    if (!a) return 0;
    const ao = a
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/);
    const bo = (b || "")
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/);
    const matches = ao.filter((w) => bo.includes(w)).length;
    return matches / ao.length;
  };

  const markVideoWatched = () => {
    setVideoWatched(true);
    setCompletion(30);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-green-100 flex flex-col items-center p-6">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl p-6 relative">
        <h1 className="text-3xl font-bold text-center mb-6 text-teal-700">
          {moduleData.title}
        </h1>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
          <div
            className="bg-teal-600 h-3 rounded-full transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>

        {/* Step 1 - Video */}
        {step === 1 && (
          <div className="snap-center min-w-[90%]">
            <h2 className="text-xl font-semibold mb-2">
              🎬 Step 1 — Watch the Video
            </h2>
            <div className="w-full rounded-lg overflow-hidden mb-3">
              <div id={ytContainerId} className="w-full h-[320px] bg-black" />
            </div>
            <div className="flex gap-3 items-center">
              {!videoWatched ? (
                <>
                  <p className="text-sm text-gray-600">
                    Watch full video to unlock practice session.
                  </p>
                  <button
                    onClick={markVideoWatched}
                    className="ml-auto bg-teal-600 text-white px-4 py-2 rounded"
                  >
                    Mark as Watched
                  </button>
                </>
              ) : (
                <p className="text-sm text-teal-700 font-medium">
                  ✅ Video watched — Practice unlocked.
                </p>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  if (videoWatched) setStep(2);
                }}
                className="bg-teal-600 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                Next ➡
              </button>
            </div>
          </div>
        )}

        {/* Step 2 - Practice */}
        {step === 2 && (
          <div className="snap-center min-w-[90%]">
            <h2 className="text-xl font-semibold mb-3">
              🎤 Step 2 — Conversation Practice
            </h2>
            <div className="p-4 border rounded mb-4">
              <p className="text-sm text-gray-700 mb-2">
                Press <strong>Play Sentence</strong> to hear a prompt, then
                press <strong>Speak Now</strong> and answer naturally.
              </p>
              <div className="flex gap-3 items-center">
                <button
                  onClick={() => playPracticeSentence()}
                  className="bg-teal-600 text-white px-4 py-2 rounded"
                >
                  ▶ Play Sentence
                </button>
                <button
                  onClick={() => {
                    const expected =
                      moduleData.practice[conversationStep]?.a || "";
                    if (!expected) return;
                    startSpeechRecognition(expected);
                  }}
                  className={`px-4 py-2 rounded ${
                    recording
                      ? "bg-red-500 text-white"
                      : "bg-teal-600 text-white"
                  }`}
                >
                  {recording ? (
                    "Listening..."
                  ) : (
                    <>
                      <Mic size={16} /> Speak Now
                    </>
                  )}
                </button>
              </div>
              <div className="mt-3 text-gray-700">
                <p>
                  Prompt:{" "}
                  <strong>
                    {moduleData.practice[conversationStep]?.q || "— finished —"}
                  </strong>
                </p>
                {userSpeech && (
                  <p className="mt-2">
                    You said: <em>{userSpeech}</em>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 - MCQs */}
        {step === 3 && (
          <div className="snap-center min-w-[90%]">
            <h2 className="text-xl font-semibold mb-3">🧩 Step 3 — Quiz</h2>
            {moduleData.mcqs.map((q, idx) => (
              <div key={idx} className="mb-4 p-3 border rounded">
                <p className="font-medium mb-2">{q.question}</p>
                {q.options.map((opt) => (
                  <label key={opt} className="block cursor-pointer mb-1">
                    <input
                      type="radio"
                      name={q.question}
                      value={opt}
                      onChange={(e) => handleAnswer(q.question, e.target.value)}
                      className="mr-2"
                    />
                    {opt}
                  </label>
                ))}
                <div className="text-sm mt-1 text-gray-700">
                  {quizFeedback[q.question]}
                </div>
              </div>
            ))}
            <div className="flex gap-3">
              <button
                onClick={submitQuiz}
                className="ml-auto bg-teal-600 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                Submit ➡
              </button>
            </div>
          </div>
        )}

        {/* Step 4 - Completion */}
        {step === 4 && (
          <div className="snap-center min-w-[90%]">
            <h2 className="text-2xl font-bold text-teal-700 mb-4 text-center">
              🎉 Module Completed!
            </h2>
            <p className="text-center text-gray-700 mb-4">
              Great job — you finished the Speaking module. Keep practising to
              improve more.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => confetti({ particleCount: 120, spread: 90 })}
                className="bg-teal-600 text-white px-6 py-3 rounded"
              >
                Celebrate 🎉
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
