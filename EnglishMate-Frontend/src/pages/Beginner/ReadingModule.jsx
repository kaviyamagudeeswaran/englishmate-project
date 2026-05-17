// src/pages/beginner/ReadingModule.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  Mic,
  StopCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
import Confetti from "canvas-confetti";
import { useAuth } from "../../context/AuthContext";

/**
 * ReadingModule — Full feature version
 * - Auto-scroll, highlight, vocab helper, timer, record audio
 * - Video -> unlock quiz
 * - Save/load progress to backend (MongoDB) via AuthContext helpers or fallback fetch
 */

export default function ReadingModule() {
  // --- AuthContext integration (use correct names from your AuthContext) ---
  const {
    user,
    fetchModuleProgress, // (userId, module) => {...}
    saveModuleProgress, // (userId, module, body) => {...}
    resetModuleProgress, // (userId, module) => {...}
  } = useAuth();

  // --- UI / state ---
  const [showVideo, setShowVideo] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [quizUnlocked, setQuizUnlocked] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(null);

  const [autoScroll, setAutoScroll] = useState(true);
  const [scrollSpeedMs, setScrollSpeedMs] = useState(5000); // change line every X ms

  const [readingText] = useState([
    "Hello! Today we will learn about my daily routine.",
    "I wake up at 7 am and brush my teeth.",
    "Then I have breakfast and get ready for school.",
    "At school, I learn English, Math, and Science.",
    "After school, I play with my friends and do homework.",
    "In the evening, I have dinner and read a book.",
    "Finally, I go to bed at 10 pm and sleep well.",
    "Reading every day helps improve language skills.",
    "Practice speaking clearly and confidently.",
    "The more you practice, the better you become.",
  ]);

  const moduleId = "reading";
  const playerIframeRef = useRef(null);
  const playerRef = useRef(null);

  // reading practice
  const scrollBoxRef = useRef(null);
  const [currentLine, setCurrentLine] = useState(0);
  const lineTimerRef = useRef(null);

  const [recording, setRecording] = useState(false);
  const [speechText, setSpeechText] = useState("");
  const [practiceCompleted, setPracticeCompleted] = useState(false);

  // tracking/timer
  const [readingTimer, setReadingTimer] = useState(0);
  const readingTimerRef = useRef(null);
  const [timerRunning, setTimerRunning] = useState(false);

  // highlight & vocab
  const [highlights, setHighlights] = useState({}); // {index: true}
  const [vocabList, setVocabList] = useState([]); // saved words
  const [vocabPopup, setVocabPopup] = useState({
    open: false,
    word: "",
    x: 0,
    y: 0,
    meaning: "",
  });

  // mcq quiz
  const [userAnswers, setUserAnswers] = useState({});
  const moduleMCQs = [
    {
      id: "q1",
      question: "What time does he wake up?",
      options: ["6 am", "7 am", "8 am"],
      answer: "7 am",
    },
    {
      id: "q2",
      question: "What does he do after school?",
      options: ["Play with friends", "Sleep", "Go shopping"],
      answer: "Play with friends",
    },
    {
      id: "q3",
      question: "When does he go to bed?",
      options: ["9 pm", "10 pm", "11 pm"],
      answer: "10 pm",
    },
  ];

  // audio recording
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // progress
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [progressOpen, setProgressOpen] = useState(true);

  // ----------------- HELPERS: Backend calls with fallbacks -----------------
  const getUserId = () => user?._id || user?.id || user?.email || null;

  async function backendFetchProgress(userId, module) {
    // try AuthContext helper first
    try {
      if (fetchModuleProgress) {
        return await fetchModuleProgress(userId, module);
      }
    } catch (err) {
      console.warn("fetchModuleProgress helper failed:", err);
    }

    // fallback fetch
    try {
      const res = await fetch(`/api/userProgress/${userId}/${module}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn("fallback fetch progress failed:", err);
      return null;
    }
  }

  async function backendSaveProgress(userId, module, body) {
    try {
      if (saveModuleProgress) {
        return await saveModuleProgress(userId, module, body);
      }
    } catch (err) {
      console.warn("saveModuleProgress helper failed:", err);
    }

    // fallback POST
    try {
      const res = await fetch("/api/userProgress/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, module, ...body }),
      });
      return await res.json();
    } catch (err) {
      console.warn("fallback save progress failed:", err);
      return null;
    }
  }

  async function backendResetProgress(userId, module) {
    try {
      if (resetModuleProgress) {
        return await resetModuleProgress(userId, module);
      }
    } catch (err) {
      console.warn("resetModuleProgress helper failed:", err);
    }

    try {
      const res = await fetch("/api/userProgress/restart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, module }),
      });
      return await res.json();
    } catch (err) {
      console.warn("fallback reset progress failed:", err);
      return null;
    }
  }

  // ----------------- LOAD PROGRESS ON MOUNT -----------------
  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;

    (async () => {
      const data = await backendFetchProgress(userId, moduleId);
      if (!data) return;
      setVideoWatched(Boolean(data.videoWatched));
      // Unlock quiz if video previously watched or reading completed
      setQuizUnlocked(
        Boolean(data.quizUnlocked || data.videoWatched || data.readingCompleted)
      );
      setScore(typeof data.score === "number" ? data.score : null);
      setPracticeCompleted(
        Boolean(data.practiceCompleted || data.readingCompleted)
      );
      setCompletionPercentage(data.progress || 0);
      setCurrentLine(data.currentLine || 0);
      setUserAnswersFromBackend(data.userAnswers || {});
      setHighlights(data.highlights || {});
      setVocabList(data.vocabList || []);
      setReadingTimer(data.timeSpent || 0);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // helper: restore userAnswers shape
  const setUserAnswersFromBackend = (answers) => {
    // if backend stored as object keyed by question ids
    setUserAnswers(answers || {});
  };

  // ----------------- SAVE PROGRESS WHEN IMPORTANT CHANGES -------------
  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;

    // throttle/save on change
    const toSave = {
      videoWatched,
      quizUnlocked,
      score,
      practiceCompleted,
      progress: completionPercentage,
      currentLine,
      userAnswers,
      highlights,
      vocabList,
      timeSpent: readingTimer,
    };

    // best-effort save
    backendSaveProgress(userId, moduleId, toSave).catch((e) =>
      console.warn("save failed", e)
    );
  }, [
    videoWatched,
    quizUnlocked,
    score,
    practiceCompleted,
    completionPercentage,
    currentLine,
    JSON.stringify(userAnswers),
    JSON.stringify(highlights),
    JSON.stringify(vocabList),
    readingTimer,
  ]);

  // ----------------- YOUTUBE: detect finish with API -----------------
  useEffect(() => {
    if (!showVideo) return;

    // inject YT iframe api if not exists
    if (!window.YT) {
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(s);
    }

    // create player when API ready
    window.onYouTubeIframeAPIReady = () => {
      try {
        playerRef.current = new window.YT.Player("reading-video-iframe", {
          events: {
            onStateChange: (e) => {
              if (e.data === window.YT.PlayerState.ENDED) {
                setVideoWatched(true);
                setQuizUnlocked(true);
                // update progress immediately
                const userId = getUserId();
                if (userId)
                  backendSaveProgress(userId, moduleId, {
                    videoWatched: true,
                    quizUnlocked: true,
                  });
              }
            },
          },
        });
      } catch (err) {
        console.warn("YT player create failed:", err);
      }
    };

    // If YT already present, create player directly
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
      } catch (err) {
        console.warn("player init error", err);
      }
    }

    // cleanup not strictly necessary for single-use
    return () => {
      // optionally destroy player if you want
      try {
        if (playerRef.current && playerRef.current.destroy)
          playerRef.current.destroy();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showVideo]);

  // ----------------- AUTO-SCROLL functions -----------------
  function startAutoScroll() {
    if (!scrollBoxRef.current) return;
    // clear any previous
    stopAutoScroll();

    // start line changer
    lineTimerRef.current = setInterval(() => {
      setCurrentLine((prev) => {
        const next = prev + 1;
        if (next < readingText.length) {
          // scroll to that element
          const el = scrollBoxRef.current.children[next];
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          return next;
        } else {
          // finished
          clearInterval(lineTimerRef.current);
          finishPractice();
          return prev;
        }
      });
    }, scrollSpeedMs);
  }

  function stopAutoScroll() {
    if (lineTimerRef.current) clearInterval(lineTimerRef.current);
  }

  // ----------------- READING TIMER -----------------
  function startReadingTimer() {
    if (readingTimerRef.current) clearInterval(readingTimerRef.current);
    setTimerRunning(true);
    readingTimerRef.current = setInterval(() => {
      setReadingTimer((t) => t + 1);
    }, 1000);
  }

  function stopReadingTimer() {
    setTimerRunning(false);
    if (readingTimerRef.current) clearInterval(readingTimerRef.current);
  }

  // ----------------- PRACTICE: start / finish / record -----------------
  function startPractice() {
    setRecording(true);
    setSpeechText("");
    setPracticeCompleted(false);
    setCurrentLine(0);
    // start auto scroll if chosen
    if (autoScroll) startAutoScroll();
    startReadingTimer();

    // start microphone recording (optional)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const mr = new MediaRecorder(stream);
          mediaRecorderRef.current = mr;
          audioChunksRef.current = [];
          mr.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data);
          };
          mr.onstop = async () => {
            // upload audio to backend (optional)
            const blob = new Blob(audioChunksRef.current, {
              type: "audio/webm",
            });
            // upload if endpoint present
            const userId = getUserId();
            if (userId) {
              try {
                const fd = new FormData();
                fd.append(
                  "audio",
                  blob,
                  `reading-${userId}-${Date.now()}.webm`
                );
                fd.append("userId", userId);
                fd.append("module", moduleId);
                await fetch("/api/userProgress/upload-audio", {
                  method: "POST",
                  body: fd,
                });
              } catch (err) {
                console.warn("audio upload failed", err);
              }
            }
          };
          mr.start();
        })
        .catch((err) => {
          console.warn("mic permission failed:", err);
        });
    }
  }

  function finishPractice() {
    // stop recording + timer + auto scroll
    setRecording(false);
    setPracticeCompleted(true);
    setCompletionPercentage(100);
    stopAutoScroll();
    stopReadingTimer();
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    Confetti();
  }

  function stopPracticeManual() {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    finishPractice();
  }

  // ----------------- HIGHLIGHT / VOCAB -----------------
  function toggleHighlight(index) {
    setHighlights((h) => {
      const copy = { ...h };
      if (copy[index]) delete copy[index];
      else copy[index] = true;
      return copy;
    });
  }

  // tiny inline dictionary (example). Replace with API if you want.
  const DICT = {
    routine:
      "a sequence of actions regularly followed; a fixed program. (ex: my daily routine)",
    practice:
      "repeated exercise in or performance of an activity to improve skill.",
    confidence:
      "the feeling or belief that one can rely on someone or something.",
    breakfast: "a meal eaten in the morning, the first of the day.",
    // add more words as needed
  };

  function handleWordClick(word, e) {
    // normalize small punctuation
    const w = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
    const meaning = DICT[w] || "Definition not found.";
    setVocabPopup({ open: true, word: w, x: e.clientX, y: e.clientY, meaning });
  }

  function addToVocab(word) {
    setVocabList((v) => {
      if (v.includes(word)) return v;
      return [...v, word];
    });
    setVocabPopup({ ...vocabPopup, open: false });
  }

  // ----------------- QUIZ HANDLERS -----------------
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
    // reward confetti if full score
    if (s === moduleMCQs.length) Confetti();

    // unlock practice if passed (optional)
    if (s >= 2) {
      setQuizUnlocked(true);
    }

    // update backend
    const userId = getUserId();
    if (userId) {
      backendSaveProgress(userId, moduleId, {
        quizCompleted: true,
        score: s,
        userAnswers,
      });
    }
  }

  // ----------------- RESTART / RESET -----------------
  async function restartModule() {
    const userId = getUserId();
    if (userId) await backendResetProgress(userId, moduleId);

    // reset UI state
    setShowVideo(false);
    setVideoWatched(false);
    setQuizUnlocked(false);
    setUserAnswers({});
    setScore(null);
    setPracticeCompleted(false);
    setCompletionPercentage(0);
    setCurrentLine(0);
    setHighlights({});
    setVocabList([]);
    setReadingTimer(0);
  }

  // local setters for userAnswers/higher-level state to avoid name confusion
  // const [userAnswersState, setUserAnswers] = useState({});
  // const userAnswers = userAnswersState;
  // const setUserAnswers = setUserAnswers;

  // ---------- RENDER ----------
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="bg-teal-700 text-white p-4 rounded-lg text-center">
        <h1 className="text-3xl font-bold">Beginner Level - Reading Module</h1>
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

        <button
          onClick={restartModule}
          className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
        >
          <RotateCcw size={18} /> Restart
        </button>
      </div>

      {/* Main module card */}
      <div className="bg-white shadow-xl rounded-2xl p-6 mt-6 mx-auto max-w-3xl">
        {/* Start module / show video */}
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
            {/* VIDEO iframe (YouTube API expects id) */}
            <div className="mb-6">
              <iframe
                id="reading-video-iframe"
                ref={playerIframeRef}
                width="100%"
                height="250"
                src={`${"https://www.youtube.com/embed/3AR98xNieJo"}?enablejsapi=1`}
                title="Reading lesson"
                frameBorder="0"
                allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="rounded-xl mb-2"
              />
              {!videoWatched && (
                <p className="text-sm text-gray-500">
                  ⏳ Watch the full video to unlock quiz.
                </p>
              )}
              {videoWatched && !quizUnlocked && (
                <div className="mt-2">
                  <button
                    onClick={() => setQuizUnlocked(true)}
                    className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                  >
                    Unlock Quiz
                  </button>
                </div>
              )}
            </div>

            {/* QUIZ */}
            {quizUnlocked && (
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

                {!quizCompleted ? (
                  <button
                    onClick={submitQuiz}
                    className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                  >
                    Submit Answers
                  </button>
                ) : (
                  <div className="mt-2">
                    <p className="font-semibold">
                      Score: {score}/{moduleMCQs.length}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* READING PRACTICE */}
            {quizCompleted && !practiceCompleted && (
              <div className="p-4 bg-gray-50 rounded-xl shadow">
                <h3 className="font-bold mb-3">📖 Reading Practice</h3>

                {/* controls */}
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
                      onClick={stopPracticeManual}
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

                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Time read: {Math.floor(readingTimer / 60)}m{" "}
                    {readingTimer % 60}s
                  </p>
                </div>

                {/* reading passage with highlight and vocab: split into words clickable */}
                <div
                  ref={scrollBoxRef}
                  className="bg-white p-4 rounded-xl h-56 overflow-y-auto mb-3 border"
                >
                  {readingText.map((line, idx) => (
                    <p
                      key={idx}
                      className={`mb-3 p-1 rounded ${
                        highlights[idx] ? "bg-yellow-100 font-semibold" : ""
                      }`}
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleHighlight(idx)}
                      title="Click to toggle highlight"
                    >
                      {/* split words so each is clickable for vocab */}
                      {line.split(" ").map((w, wi) => {
                        const clean = w.replace(/[^a-zA-Z]/g, "").toLowerCase();
                        return (
                          <span
                            key={wi}
                            style={{ marginRight: 6 }}
                            onClick={(e) => {
                              e.stopPropagation(); // prevent line highlight
                              handleWordClick(w, e);
                            }}
                          >
                            {w}
                          </span>
                        );
                      })}
                    </p>
                  ))}
                </div>

                {vocabPopup.open && (
                  <div
                    style={{
                      position: "fixed",
                      left: vocabPopup.x,
                      top: vocabPopup.y,
                      background: "white",
                      padding: 12,
                      borderRadius: 8,
                      boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                      zIndex: 60,
                    }}
                  >
                    <p style={{ fontWeight: 700 }}>{vocabPopup.word}</p>
                    <p style={{ fontSize: 13 }}>{vocabPopup.meaning}</p>
                    <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                      <button
                        onClick={() => addToVocab(vocabPopup.word)}
                        className="bg-teal-600 text-white px-3 py-1 rounded"
                      >
                        + Add
                      </button>
                      <button
                        onClick={() =>
                          setVocabPopup({ ...vocabPopup, open: false })
                        }
                        className="px-2 py-1 border rounded"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 items-center mt-2">
                  <p className="text-sm">
                    Vocabulary list: {vocabList.join(", ") || "—"}
                  </p>
                </div>

                <div className="mt-4">
                  {recording && (
                    <p className="text-red-600">Recording... speak clearly</p>
                  )}
                  {speechText && (
                    <p className="italic text-gray-700">
                      You said: “{speechText}”
                    </p>
                  )}
                </div>
              </div>
            )}

            {practiceCompleted && (
              <div className="p-4 bg-green-50 rounded-xl shadow text-center">
                <h3 className="font-bold text-green-700 text-lg">
                  ✅ Practice Completed
                </h3>
                <p className="mt-2">You’ve finished reading — well done!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
