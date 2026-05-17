// src/pages/Advance/ReadingAdvanced.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  StopCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
import Confetti from "canvas-confetti";
import { useAuth } from "../../context/AuthContext";

export default function ReadingAdvanced() {
  const { user } = useAuth();

  const moduleId = "readingAdvanced";

  // --- VIDEO ---
  const [showVideo, setShowVideo] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);

  const playerRef = useRef(null);

  // --- QUIZ ---
  const [quizUnlocked, setQuizUnlocked] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});

  const moduleMCQs = [
    {
      id: "q1",
      question: "What is considered the cornerstone of a successful workplace?",
      options: [
        "Technology",
        "Effective communication",
        "Salary",
        "Office location",
      ],
      answer: "Effective communication",
    },
    {
      id: "q2",
      question: "Active listening means:",
      options: [
        "Waiting for your turn to speak",
        "Understanding and responding thoughtfully",
        "Ignoring non-verbal cues",
      ],
      answer: "Understanding and responding thoughtfully",
    },
    {
      id: "q3",
      question: "Non-verbal communication includes:",
      options: ["Body language", "Emails", "Reports", "Phone calls"],
      answer: "Body language",
    },
  ];

  // --- READING PRACTICE ---
  const readingText = [
    "Effective communication is the cornerstone of a successful workplace.",
    "It not only helps employees convey ideas clearly but also fosters collaboration.",
    "Good communication involves both speaking and listening skills.",
    "Active listening requires full attention to the speaker and thoughtful response.",
    "Non-verbal cues like body language and facial expressions reinforce messages.",
    "Constructive feedback encourages growth, motivates employees, and strengthens team dynamics.",
    "Technology-mediated communication requires clarity and proper tone.",
    "Improving communication is ongoing and enhances professional relationships.",
  ];

  const [currentLine, setCurrentLine] = useState(0);
  const scrollBoxRef = useRef(null);
  const lineTimerRef = useRef(null);

  const [recording, setRecording] = useState(false);
  const [speechText, setSpeechText] = useState("");
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [opinionText, setOpinionText] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [progressOpen, setProgressOpen] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [scrollSpeedMs, setScrollSpeedMs] = useState(6000);

  // ----------------- VIDEO HANDLER -----------------
  useEffect(() => {
    if (!showVideo) return;

    if (!window.YT) {
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(s);
    }

    window.onYouTubeIframeAPIReady = () => {
      try {
        playerRef.current = new window.YT.Player("reading-video-iframe", {
          events: {
            onStateChange: (e) => {
              if (e.data === window.YT.PlayerState.ENDED) {
                setVideoWatched(true);
                setQuizUnlocked(true);
              }
            },
          },
        });
      } catch (err) {
        console.warn("YT player error:", err);
      }
    };

    if (window.YT && !playerRef.current) {
      try {
        playerRef.current = new window.YT.Player("reading-video-iframe", {
          events: {
            onStateChange: (e) => {
              if (e.data === window.YT.PlayerState.ENDED) {
                setVideoWatched(true);
                setQuizUnlocked(true);
              }
            },
          },
        });
      } catch {}
    }
  }, [showVideo]);

  // ----------------- QUIZ HANDLER -----------------
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
    if (s === moduleMCQs.length) Confetti();
  }

  // ----------------- PRACTICE HANDLERS -----------------
  function startPractice() {
    setRecording(true);
    setPracticeCompleted(false);
    setCurrentLine(0);
    setSpeechText("");
    setSummaryText("");
    setOpinionText("");
    if (autoScroll) startAutoScroll();

    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const mr = new MediaRecorder(stream);
          mediaRecorderRef.current = mr;
          audioChunksRef.current = [];
          mr.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data);
          };
          mr.start();
        })
        .catch((err) => console.warn("Mic failed:", err));
    }
  }

  function stopPractice() {
    setRecording(false);
    if (lineTimerRef.current) clearInterval(lineTimerRef.current);

    if (mediaRecorderRef.current?.state === "recording")
      mediaRecorderRef.current.stop();
    setPracticeCompleted(true);
    setCompletionPercentage(100);
    Confetti();
  }

  // ----------------- AUTO-SCROLL -----------------
  function startAutoScroll() {
    if (!scrollBoxRef.current) return;
    lineTimerRef.current = setInterval(() => {
      setCurrentLine((prev) => {
        const next = prev + 1;
        if (next < readingText.length) {
          const el = scrollBoxRef.current.children[next];
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          return next;
        } else {
          clearInterval(lineTimerRef.current);
          return prev;
        }
      });
    }, scrollSpeedMs);
  }

  // ----------------- RENDER -----------------
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="bg-teal-700 text-white p-4 rounded-lg text-center">
        <h1 className="text-3xl font-bold">Advanced Level - Reading Module</h1>
      </header>

      {/* Progress tracker */}
      <div className="bg-white shadow p-4 flex justify-between items-center mt-4 rounded-lg max-w-4xl mx-auto">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setProgressOpen((s) => !s)}
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

      {/* Main Module */}
      <div className="bg-white shadow-xl rounded-2xl p-6 mt-6 mx-auto max-w-3xl">
        {!showVideo ? (
          <div className="text-center">
            <p className="text-lg mb-4">Click below to start the module.</p>
            <button
              onClick={() => setShowVideo(true)}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700"
            >
              ▶️ Start Module
            </button>
          </div>
        ) : (
          <>
            {/* VIDEO */}
            <div className="mb-6">
              <iframe
                id="reading-video-iframe"
                width="100%"
                height="250"
                src="https://www.youtube.com/embed/x8xv3ieNnks?enablejsapi=1"
                title="Advanced Reading Lesson"
                frameBorder="0"
                allowFullScreen
                className="rounded-xl mb-2"
              />
              {!videoWatched && (
                <p className="text-sm text-gray-500">
                  ⏳ Watch full video to unlock quiz.
                </p>
              )}
            </div>

            {/* QUIZ */}
            {videoWatched && !quizCompleted && (
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

            {/* READING PRACTICE */}
            {quizCompleted && !practiceCompleted && (
              <div className="p-4 bg-gray-50 rounded-xl shadow">
                <h3 className="font-bold mb-3">📖 Reading Practice</h3>

                <div className="flex items-center gap-3 mb-3">
                  {!recording ? (
                    <button
                      onClick={startPractice}
                      className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 flex items-center gap-2"
                    >
                      <Mic /> Start Reading
                    </button>
                  ) : (
                    <button
                      onClick={stopPractice}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
                    >
                      <StopCircle /> Stop
                    </button>
                  )}
                  <label className="ml-3">
                    <input
                      type="checkbox"
                      checked={autoScroll}
                      onChange={(e) => setAutoScroll(e.target.checked)}
                    />{" "}
                    Auto-scroll
                  </label>
                  <label className="ml-3">
                    Speed:
                    <select
                      value={scrollSpeedMs}
                      onChange={(e) => setScrollSpeedMs(Number(e.target.value))}
                      className="ml-2 border px-1"
                    >
                      <option value={8000}>Slow</option>
                      <option value={6000}>Medium</option>
                      <option value={4000}>Fast</option>
                    </select>
                  </label>
                </div>

                {/* READING ARTICLE */}
                <div
                  ref={scrollBoxRef}
                  className="bg-white p-4 rounded-xl h-56 overflow-y-auto mb-3 border"
                >
                  {readingText.map((line, idx) => (
                    <p key={idx} className="mb-3 p-1 rounded">
                      {line}
                    </p>
                  ))}
                </div>

                {/* SUMMARY TASK */}
                {recording && (
                  <textarea
                    placeholder="Summarize the article here (≥50 words)..."
                    className="w-full border rounded p-2 mb-3"
                    value={summaryText}
                    onChange={(e) => setSummaryText(e.target.value)}
                  />
                )}

                {/* OPINION TASK */}
                {recording && (
                  <textarea
                    placeholder='Answer the question: "Do you agree communication skills are critical? Why?" (≥45 sec speaking)'
                    className="w-full border rounded p-2 mb-3"
                    value={opinionText}
                    onChange={(e) => setOpinionText(e.target.value)}
                  />
                )}
              </div>
            )}

            {practiceCompleted && (
              <div className="p-4 bg-green-50 rounded-xl shadow text-center">
                <h3 className="font-bold text-green-700 text-lg">
                  ✅ Practice Completed
                </h3>
                <p className="mt-2">
                  You’ve finished the reading practice — well done!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
