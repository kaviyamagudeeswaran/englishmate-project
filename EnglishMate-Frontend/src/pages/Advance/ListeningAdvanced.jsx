import React, { useState, useEffect, useRef } from "react";
import { Ear, Mic, Menu, RotateCcw } from "lucide-react";
import Confetti from "canvas-confetti";
import Swal from "sweetalert2";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

/**
 * Advanced Listening - Conversation Practice (frontend only)
 *
 * - Video (YouTube iframe) -> watch to unlock quiz
 * - Quiz (MCQ)
 * - AI Spoken Conversation:
 *   - AI speaks prompts using Web Speech API (speechSynthesis)
 *   - User replies using Web SpeechRecognition (start/stop)
 *   - Each user reply is sent to backend /api/ai/next to get next prompt (if available)
 *   - Conversation lasts minimum `minDurationSeconds` (default 5 minutes). Progress updates with time.
 *   - When finished, frontend calls /api/ai/feedback to request final spoken feedback (backend should analyze conversation)
 *
 * NOTE: Backend endpoints used:
 *   POST /api/ai/next       -> { conversationHistory, userEmail } => { prompt }
 *   POST /api/ai/feedback   -> { conversationHistory, userEmail } => { feedback }
 *
 * If backend is not available the UI will still work locally (AI uses simple local fallbacks).
 */

export default function ListeningAdvanced() {
  const { user, saveListeningProgress, fetchListeningProgress } = useAuth();

  // UI & progress state
  const [showVideo, setShowVideo] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [quizUnlocked, setQuizUnlocked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // MCQ
  const [userAnswer, setUserAnswer] = useState({});
  const [score, setScore] = useState(null);

  // Conversation practice
  const [conversationActive, setConversationActive] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]); // { speaker: "AI"|"User", text, ts }
  const [speakingActive, setSpeakingActive] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [aiFinalFeedback, setAiFinalFeedback] = useState("");
  const recognitionRef = useRef(null);
  const convTimerRef = useRef(null);
  const conversationStartTime = useRef(null);

  // Minimum conversation length and update frequency
  const minDurationSeconds = 5 * 60; // 5 minutes
  const progressTickMs = 3000;

  // Module static data / defaults
  const moduleData = {
    title: "Advanced Listening (Conversation Practice)",
    video: "https://www.youtube.com/embed/cMyBmzJJ1bs?enablejsapi=1",
    mcqs: [
      {
        question: "What is the topic mainly about?",
        options: ["Practice habits", "Holiday trip", "Cooking"],
        answer: "Practice habits",
      },
      {
        question: "How often does he practice?",
        options: ["Daily", "Weekly", "Never"],
        answer: "Daily",
      },
    ],
    initialPrompt: "Hi! Let's practice speaking — how was your day today?",
    // fallback prompts if backend isn't reachable
    fallbackPrompts: [
      "That's nice — what made it special?",
      "How do you usually spend your evenings?",
      "Tell me a little about your hobbies.",
      "What do you want to improve in English?",
    ],
  };

  // -------------------------
  // Load / save progress
  // -------------------------
  useEffect(() => {
    const loadProgress = async () => {
      if (!user?.email) return;
      try {
        const data = await fetchListeningProgress("advanced_listening");
        if (data) {
          setVideoWatched(data.videoWatched || false);
          setQuizUnlocked(data.quizUnlocked || false);
          setScore(data.score ?? null);
          setCompletionPercentage(data.progress || 0);
          setConversationHistory(data.conversationHistory || []);
          setAiFinalFeedback(data.aiFinalFeedback || "");
        }
      } catch (err) {
        console.warn("Failed to load progress:", err);
      }
    };
    loadProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // autosave when key states change
  useEffect(() => {
    if (!user?.email) return;
    // debounce-ish: small timeout to avoid spamming backend
    const t = setTimeout(() => {
      saveListeningProgress({
        module: "advanced_listening",
        progress: completionPercentage,
        videoWatched,
        quizUnlocked,
        score,
        conversationHistory,
        aiFinalFeedback,
      });
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    videoWatched,
    quizUnlocked,
    score,
    conversationHistory,
    aiFinalFeedback,
    completionPercentage,
  ]);

  // -------------------------
  // YouTube player detection (to mark videoWatched)
  // -------------------------
  useEffect(() => {
    if (window.YT) return;
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!showVideo) return;
    const intv = setInterval(() => {
      if (window.YT && window.YT.Player) {
        clearInterval(intv);
        // create a player to monitor end event (player id must match iframe's id)
        try {
          const player = new window.YT.Player("ytplayer", {
            events: {
              onStateChange: (event) => {
                if (event.data === window.YT.PlayerState.ENDED) {
                  setVideoWatched(true);
                  setCompletionPercentage((p) => Math.max(p, 40));
                }
              },
            },
          });
          return () => player.destroy();
        } catch (e) {
          console.warn("YT player init error", e);
        }
      }
    }, 400);
    return () => clearInterval(intv);
  }, [showVideo]);

  // -------------------------
  // MCQ handling
  // -------------------------
  const handleSubmitMCQ = () => {
    let correct = 0;
    moduleData.mcqs.forEach((q) => {
      if (userAnswer[q.question] === q.answer) correct++;
    });
    setScore(correct);
    if (correct === moduleData.mcqs.length) {
      Confetti();
      setCompletionPercentage(70);
      Swal.fire({ icon: "success", title: "Great Job!", timer: 1200 });
    } else {
      Swal.fire({
        icon: "info",
        title: `You scored ${correct}/${moduleData.mcqs.length}`,
        text: "Keep going — the spoken conversation will help more!",
      });
    }
  };

  // -------------------------
  // TTS & recognition helpers
  // -------------------------
  const speakAI = (text, opts = {}) => {
    if (!("speechSynthesis" in window)) {
      console.warn("SpeechSynthesis not supported");
      return;
    }
    setAiSpeaking(true);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = opts.lang || "en-US";
    if (opts.rate) u.rate = opts.rate;
    if (opts.pitch) u.pitch = opts.pitch;
    u.onend = () => setAiSpeaking(false);
    // stop any existing speech and speak new
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn("TTS error", e);
      setAiSpeaking(false);
    }
  };

  // -------------------------
  // Conversation flow
  // -------------------------
  const handleStartConversation = () => {
    setConversationActive(true);
    conversationStartTime.current = Date.now();
    setConversationHistory((prev) => [
      ...prev,
      { speaker: "AI", text: moduleData.initialPrompt, ts: Date.now() },
    ]);
    speakAI(moduleData.initialPrompt);
    setCompletionPercentage((p) => Math.max(p, 75));

    // start periodic timer to update progress & finalize when duration met
    convTimerRef.current = setInterval(() => {
      updateProgressByTime();
    }, progressTickMs);
  };

  const stopConversationFlow = async () => {
    // stop recognition if active
    try {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      }
    } catch (e) {
      /* ignore */
    }

    // stop periodic timer
    if (convTimerRef.current) {
      clearInterval(convTimerRef.current);
      convTimerRef.current = null;
    }
    setConversationActive(false);
    // request final feedback if there were user turns
    if (conversationHistory.some((m) => m.speaker === "User")) {
      await requestFinalFeedback();
    }
  };

  // Start speech recognition for user's reply
  const handleUserStart = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onstart = () => setSpeakingActive(true);

    recognitionRef.current.onresult = async (event) => {
      const userText = event.results[0][0].transcript;
      // add user utterance locally
      setConversationHistory((prev) => [
        ...prev,
        { speaker: "User", text: userText, ts: Date.now() },
      ]);

      // immediately ask backend for the next prompt (or fallback locally)
      try {
        const payload = {
          conversationHistory: [
            ...conversationHistory,
            { speaker: "User", text: userText, ts: Date.now() },
          ],
          userEmail: user?.email,
        };
        const res = await axios.post("/api/ai/next", payload, {
          timeout: 8000,
        });
        const nextPrompt = res?.data?.prompt;
        if (nextPrompt) {
          setConversationHistory((prev) => [
            ...prev,
            { speaker: "AI", text: nextPrompt, ts: Date.now() },
          ]);
          // small pause before AI speaks to feel natural
          setTimeout(() => speakAI(nextPrompt), 350);
        } else {
          // fallback to a local prompt if backend didn't return a prompt
          const fallback = chooseFallbackPrompt();
          setConversationHistory((prev) => [
            ...prev,
            { speaker: "AI", text: fallback, ts: Date.now() },
          ]);
          setTimeout(() => speakAI(fallback), 350);
        }
      } catch (err) {
        console.warn("AI next error, using fallback", err);
        const fallback = chooseFallbackPrompt();
        setConversationHistory((prev) => [
          ...prev,
          { speaker: "AI", text: fallback, ts: Date.now() },
        ]);
        setTimeout(() => speakAI(fallback), 350);
      }

      // update progress on each reply
      updateProgressByTime();
    };

    recognitionRef.current.onend = () => setSpeakingActive(false);
    recognitionRef.current.onerror = (e) => {
      console.warn("Recognition error", e);
      setSpeakingActive(false);
    };

    recognitionRef.current.start();
  };

  // User can stop the recognition manually
  const handleUserStop = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("stop error", e);
      }
    }
  };

  // choose a fallback AI prompt cycling through fallbackPrompts
  const chooseFallbackPrompt = () => {
    const idx = conversationHistory.filter((m) => m.speaker === "AI").length;
    return moduleData.fallbackPrompts[idx % moduleData.fallbackPrompts.length];
  };

  // request final spoken feedback from backend (if available), otherwise produce a simple local summary
  const requestFinalFeedback = async () => {
    try {
      const res = await axios.post(
        "/api/ai/feedback",
        {
          conversationHistory,
          userEmail: user?.email,
        },
        { timeout: 12000 }
      );

      const feedback = res?.data?.feedback;
      if (feedback) {
        setAiFinalFeedback(feedback);
        // speak the feedback
        speakAI(feedback, { rate: 0.95 });
        Confetti();
        setCompletionPercentage(100);
        return;
      }
    } catch (err) {
      console.warn("AI feedback call failed:", err);
    }

    // Fallback final summary if backend not available
    const fallback = createLocalFinalFeedback();
    setAiFinalFeedback(fallback);
    speakAI(fallback, { rate: 0.95 });
    Confetti();
    setCompletionPercentage(100);
  };

  const createLocalFinalFeedback = () => {
    const userTurns = conversationHistory.filter(
      (m) => m.speaker === "User"
    ).length;
    if (userTurns === 0)
      return "I didn't hear you speak much. Try to reply with longer answers next time.";
    // simple heuristic feedback
    return "Nice effort! Pronunciation: generally clear. Vocabulary: appropriate for the topics. Improvements: try to give longer answers and use more descriptive words.";
  };

  // update completion percentage by elapsed conversation time
  const updateProgressByTime = () => {
    if (!conversationStartTime.current) return;
    const elapsed = (Date.now() - conversationStartTime.current) / 1000; // seconds
    const percentFromConversation = Math.min(
      100,
      75 + Math.floor((elapsed / minDurationSeconds) * 25)
    );
    setCompletionPercentage(percentFromConversation);
    // if we've reached minimum and have at least one user turn, finalize conversation automatically
    const hasUserTurn = conversationHistory.some((m) => m.speaker === "User");
    if (elapsed >= minDurationSeconds && hasUserTurn) {
      // finalize
      // clear interval and request final feedback
      if (convTimerRef.current) {
        clearInterval(convTimerRef.current);
        convTimerRef.current = null;
      }
      requestFinalFeedback();
    }
  };

  // cleanup recognition & timers on unmount
  useEffect(() => {
    return () => {
      try {
        if (recognitionRef.current) recognitionRef.current.onresult = null;
      } catch (e) {}
      if (convTimerRef.current) clearInterval(convTimerRef.current);
    };
  }, []);

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* MENU BAR */}
      <div className="flex items-center justify-between bg-teal-700 text-white p-4 rounded-lg shadow">
        <button onClick={() => setMenuOpen(!menuOpen)}>
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold">Advanced Level - Listening</h1>
        <div className="flex items-center gap-2">
          <RotateCcw size={18} className="opacity-80" />
          <div className="w-2" />
        </div>
      </div>

      {/* VIDEO */}
      <div className="bg-white p-4 rounded-xl shadow mt-4 max-w-3xl mx-auto">
        {!showVideo ? (
          <button
            onClick={() => setShowVideo(true)}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg w-full"
          >
            ▶️ Start Module (Video)
          </button>
        ) : (
          <iframe
            id="ytplayer"
            width="100%"
            height="250"
            src={moduleData.video}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="rounded-xl"
            title="module video"
          />
        )}
      </div>

      {/* QUIZ */}
      {videoWatched && (
        <div className="mt-6 bg-white p-4 rounded-xl shadow max-w-3xl mx-auto">
          {!quizUnlocked ? (
            <button
              onClick={() => setQuizUnlocked(true)}
              className="bg-teal-600 text-white px-4 py-2 rounded"
            >
              Unlock Quiz
            </button>
          ) : (
            <>
              <h3 className="font-bold text-lg mb-4">🧠 Quiz</h3>
              {moduleData.mcqs.map((q, idx) => (
                <div key={idx} className="mb-4 p-2 border rounded">
                  <p className="font-semibold mb-2">{q.question}</p>
                  {q.options.map((o) => (
                    <label key={o} className="block cursor-pointer">
                      <input
                        type="radio"
                        name={q.question}
                        value={o}
                        checked={userAnswer[q.question] === o}
                        onChange={(e) =>
                          setUserAnswer({
                            ...userAnswer,
                            [q.question]: e.target.value,
                          })
                        }
                        className="mr-2"
                      />
                      {o}
                    </label>
                  ))}
                </div>
              ))}
              <button
                onClick={handleSubmitMCQ}
                className="bg-teal-600 text-white px-4 py-2 rounded"
              >
                Submit Quiz
              </button>
            </>
          )}
        </div>
      )}

      {/* AI Conversation */}
      {score === moduleData.mcqs.length && (
        <div className="p-5 mt-6 bg-white rounded-xl shadow max-w-3xl mx-auto">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">🤖 AI Spoken Conversation</h3>
            <div className="text-sm text-gray-600">
              Progress: {completionPercentage.toFixed(0)}%
            </div>
          </div>

          {!conversationActive ? (
            <div className="mt-4">
              <p className="text-sm text-gray-700 mb-3">
                This is a spoken conversation with the AI (5 min). The AI will
                speak; press Start Speaking to reply.
              </p>
              <button
                onClick={handleStartConversation}
                className="bg-teal-600 text-white px-6 py-2 rounded-lg"
              >
                Start Conversation (5 min)
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="max-h-56 overflow-y-auto p-2 bg-gray-100 rounded">
                {conversationHistory.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No messages yet — press Start Speaking when AI finishes a
                    prompt.
                  </p>
                )}
                {conversationHistory.map((m, i) => (
                  <p
                    key={i}
                    className={
                      m.speaker === "AI" ? "text-teal-700" : "text-gray-900"
                    }
                  >
                    <strong>{m.speaker}:</strong> {m.text}
                  </p>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleUserStart}
                  disabled={speakingActive || aiSpeaking}
                  className="bg-teal-600 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
                >
                  <Mic className={speakingActive ? "animate-pulse" : ""} />{" "}
                  Start Speaking
                </button>

                {speakingActive && (
                  <button
                    onClick={handleUserStop}
                    className="bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Stop
                  </button>
                )}

                <button
                  onClick={stopConversationFlow}
                  className="ml-auto bg-gray-200 text-gray-800 px-4 py-2 rounded"
                >
                  End Conversation
                </button>
              </div>

              {aiFinalFeedback && (
                <div className="mt-3 p-3 bg-green-50 rounded">
                  <p className="font-semibold">Final feedback (spoken)</p>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {aiFinalFeedback}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
