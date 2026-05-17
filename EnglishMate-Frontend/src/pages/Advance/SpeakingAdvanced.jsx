// src/pages/Advanced/SpeakingAdvanced.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios"; // optional, used if you want to hit your backend
import confetti from "canvas-confetti";
import { Mic, RotateCcw, Clipboard } from "lucide-react";

/**
 * SpeakingAdvanced.jsx
 *
 * Single-file Advanced Speaking Module:
 * - Video -> MCQ -> Practice (random prompts) -> Scoring & AI-style feedback -> Results JSON
 * - Use in Chrome for SpeechRecognition
 *
 * Notes:
 * - This uses a heuristic evaluator (word overlap + length heuristics).
 * - For production phonetic grading, integrate a dedicated speech scoring API.
 */

export default function SpeakingAdvanced({ userEmail = null }) {
  // ---- UI / Flow state ----
  const [step, setStep] = useState("video"); // video | mcq | practice | results
  const [progress, setProgress] = useState(0); // 0..100
  const [menuOpen, setMenuOpen] = useState(false);

  // ---- YouTube player ref ----
  const ytRef = useRef(null);
  const ytContainerId = "speaking-advanced-yt-player";

  // ---- MCQ state ----
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [mcqFeedback, setMcqFeedback] = useState({});
  const MCQS = [
    {
      question: "Which activity improves spoken English fastest?",
      options: [
        "Reading silently",
        "Speaking practice",
        "Watching movies only",
      ],
      answer: "Speaking practice",
    },
    {
      question: "Why read aloud?",
      options: [
        "It improves vocabulary and pronunciation",
        "It wastes time",
        "It is only for students",
      ],
      answer: "It improves vocabulary and pronunciation",
    },
  ];

  // ---- Practice prompt banks (randomized selection) ----
  const PROMPTS = {
    emotion: [
      {
        title: "Happiness",
        prompt:
          "You just received amazing news that you passed an important exam. Describe what happened, how you felt, and why it mattered.",
        expected:
          "I felt extremely happy because I passed the exam. The best part was the support I received and this achievement means a lot to my future.",
      },
      {
        title: "Fear",
        prompt:
          "You heard a strange noise while walking home at night. Describe what you felt, what you did, and what you learned.",
        expected:
          "I felt scared at first but stayed calm, moved to a safe place, and later learned to stay aware of surroundings.",
      },
      {
        title: "Surprise",
        prompt:
          "Someone unexpectedly organized a party for you. Describe your reaction and the best moments of the party.",
        expected:
          "I was surprised and grateful. The decorations and speeches made it memorable and I felt appreciated.",
      },
    ],
    realLife: [
      {
        title: "Missed Train",
        prompt:
          "You missed an important train. Explain to a friend what happened and what you did next.",
        expected:
          "I missed the train due to traffic and had to reschedule and take the next train; I called the person and apologized.",
      },
      {
        title: "Job Interview",
        prompt:
          "Describe how you prepared for a job interview and one key lesson you learned from it.",
        expected:
          "I prepared by researching the company and practicing answers; I learned to be concise and confident.",
      },
    ],
    opinion: [
      {
        title: "Technology & People",
        prompt:
          "Technology makes people smarter. Do you agree or disagree? Explain with examples.",
        expected:
          "I believe technology can help people learn faster by giving access to information, but critical thinking is still essential.",
      },
      {
        title: "Homework",
        prompt: "Should homework be banned? Give your opinion and reasons.",
        expected:
          "I think homework shouldn't be banned; meaningful assignments reinforce learning but should be limited.",
      },
    ],
    storytelling: [
      {
        title: "City Alone",
        prompt:
          "You wake up and realize you are the only person left in your city. What happens next?",
        expected:
          "I would check essentials and try to contact others, then explore the city cautiously and document what I find.",
      },
      {
        title: "Unexpected Letter",
        prompt:
          "You receive a letter with a large sum of money and no sender. Explain your actions and feelings.",
        expected:
          "I'd be cautious, try to locate the sender, and act ethically by reporting or finding the rightful owner.",
      },
    ],
  };

  // ---- Runtime selections & transcripts ----
  const [selectedPrompts, setSelectedPrompts] = useState({
    emotion: null,
    realLife: null,
    opinion: null,
    storytelling: null,
  });

  const [currentPracticeIndex, setCurrentPracticeIndex] = useState(0);
  // practice order: emotion, realLife, opinion, storytelling (we'll run 3 prompts total or all)
  const practiceOrder = ["emotion", "realLife", "opinion", "storytelling"];

  const [transcripts, setTranscripts] = useState({
    quick: "",
    emotion: "",
    realLife: "",
    opinion: "",
    storytelling: "",
  });

  // recognition guard + instance
  const recognitionRef = useRef(null);
  const [recording, setRecording] = useState(false);

  // final results JSON
  const [resultsJSON, setResultsJSON] = useState(null);

  // ---- Utility: random pick helper ----
  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // ---- Initialize selected prompts on mount ----
  useEffect(() => {
    setSelectedPrompts({
      emotion: pickRandom(PROMPTS.emotion),
      realLife: pickRandom(PROMPTS.realLife),
      opinion: pickRandom(PROMPTS.opinion),
      storytelling: pickRandom(PROMPTS.storytelling),
    });
  }, []);

  // ---- YouTube iframe API setup (with origin to avoid postMessage error) ----
  useEffect(() => {
    if (window.YT) return;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    document.body.appendChild(tag);
  }, []);

  useEffect(() => {
    if (step !== "video") return;
    const initPlayer = () => {
      if (!window.YT || ytRef.current) return;
      ytRef.current = new window.YT.Player(ytContainerId, {
        videoId: "5nGESyDgmdw",
        playerVars: {
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.ENDED) {
              // user watched video -> unlock MCQ
              setProgress((p) => Math.max(p, 20));
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) initPlayer();
    else window.onYouTubeIframeAPIReady = initPlayer;

    return () => {
      if (ytRef.current?.destroy) {
        try {
          ytRef.current.destroy();
        } catch {}
        ytRef.current = null;
      }
    };
  }, [step]);

  // ---- Speech recognition helper (single instance) ----
  const startRecognition = (onResultCallback) => {
    if (
      !("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      alert(
        "Speech recognition not supported in this browser. Use Chrome or Edge."
      );
      return;
    }
    if (recording) return; // guard

    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Rec();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setRecording(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setRecording(false);
      onResultCallback(transcript);
    };
    recognition.onerror = (e) => {
      setRecording(false);
      console.error("Speech recognition error", e);
      alert("Speech recognition error. Try again.");
    };
    recognition.onend = () => setRecording(false);

    try {
      recognition.start();
      recognitionRef.current = recognition;
      return recognition;
    } catch (err) {
      setRecording(false);
      console.error("Failed to start recognition", err);
      return null;
    }
  };

  // ---- Play TTS helper ----
  const speak = (text) => {
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    speechSynthesis.speak(u);
  };

  // ---- MCQ handlers ----
  const handleMCQChange = (question, value) => {
    setMcqAnswers((prev) => ({ ...prev, [question]: value }));
    const correct = MCQS.find((q) => q.question === question).answer;
    setMcqFeedback((prev) => ({
      ...prev,
      [question]: value === correct ? "Correct!" : "Wrong!",
    }));
  };

  const submitMCQ = () => {
    let correctCount = 0;
    MCQS.forEach((q) => {
      if (mcqAnswers[q.question] === q.answer) correctCount++;
    });
    if (correctCount >= MCQS.length) {
      setProgress(40);
      setStep("practice");
      confetti({ particleCount: 80, spread: 90 });
    } else {
      alert(
        `You scored ${correctCount}/${MCQS.length}. You need all correct (or modify requirement) to unlock practice.`
      );
    }
  };

  // ---- Practice flow handlers ----
  const currentPracticeKey = practiceOrder[currentPracticeIndex]; // eg "emotion"
  const currentPrompt = selectedPrompts[currentPracticeKey];

  const startPracticeRecording = () => {
    // reset transcript for this task
    setTranscripts((prev) => ({ ...prev, [currentPracticeKey]: "" }));
    speak(currentPrompt?.prompt);
    startRecognition((transcript) => {
      setTranscripts((prev) => ({ ...prev, [currentPracticeKey]: transcript }));
    });
  };

  const nextPractice = () => {
    if (currentPracticeIndex + 1 < practiceOrder.length) {
      setCurrentPracticeIndex((i) => i + 1);
      setProgress((p) => Math.min(90, p + 15));
    } else {
      // all practice done -> compute results
      computeResults();
    }
  };

  const retryPractice = () => {
    // clear only the current practice transcript
    setTranscripts((prev) => ({ ...prev, [currentPracticeKey]: "" }));
  };

  // ---- Simple evaluator function (heuristic) ----
  function evaluateTask(expected, spoken) {
    // Normalize
    const norm = (s) =>
      (s || "")
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter(Boolean);
    const expectedTokens = norm(expected);
    const spokenTokens = norm(spoken);
    const expectedSet = new Set(expectedTokens);

    // similarity: proportion of expected tokens found in spoken tokens
    const matches = expectedTokens.filter((t) =>
      spokenTokens.includes(t)
    ).length;
    const sim = expectedTokens.length ? matches / expectedTokens.length : 0;

    // fluency: based on spoken length (favor >= 20 words but cap)
    const wordCount = spokenTokens.length;
    const lengthScore = Math.min(1, wordCount / 40); // 0..1

    // repeated filler penalty: "um", "uh", "like"
    const fillerMatches =
      (spoken || "").match(/\b(um|uh|like|you know)\b/gi) || [];
    const fillerPenalty = Math.min(0.3, fillerMatches.length * 0.05); // up to 0.3 penalty

    // scores (0-100)
    const fluency = Math.round(
      Math.max(30, (0.4 * lengthScore + 0.6 * sim) * 100 - fillerPenalty * 100)
    );
    const pronunciation = Math.round(
      Math.max(30, (sim * 0.9 + lengthScore * 0.1) * 100)
    ); // proxy via sim
    const clarity = Math.round(
      Math.max(30, ((sim + lengthScore) / 2) * 100 - fillerPenalty * 50)
    );
    const grammar = Math.round(
      Math.max(30, Math.max(0.3, sim) * 100 - fillerPenalty * 40)
    );
    // vocabulary: measure unique words ratio
    const uniqueWords = new Set(spokenTokens).size;
    const vocabulary = Math.round(
      Math.min(
        100,
        (uniqueWords / Math.max(1, wordCount)) * 100 + Math.min(20, uniqueWords)
      )
    );

    // overall weighted
    const overall = Math.round(
      fluency * 0.3 +
        pronunciation * 0.25 +
        clarity * 0.2 +
        grammar * 0.15 +
        vocabulary * 0.1
    );

    return { fluency, pronunciation, clarity, grammar, vocabulary, overall };
  }

  // ---- Compute results across tasks and prepare JSON & AI feedback ----
  const computeResults = () => {
    // Evaluate tasks using their expected texts
    const t_emotion = evaluateTask(
      selectedPrompts.emotion?.expected,
      transcripts.emotion
    );
    const t_realLife = evaluateTask(
      selectedPrompts.realLife?.expected,
      transcripts.realLife
    );
    const t_opinion = evaluateTask(
      selectedPrompts.opinion?.expected,
      transcripts.opinion
    );
    const t_story = evaluateTask(
      selectedPrompts.storytelling?.expected,
      transcripts.storytelling
    );

    // For final output, use the three core tasks: emotion, opinion (debate), storytelling.
    const tasks = [
      {
        key: "task1",
        label: "Emotion Expression",
        prompt: selectedPrompts.emotion?.prompt,
        scores: t_emotion,
      },
      {
        key: "task2",
        label: "Opinion/Debate",
        prompt: selectedPrompts.opinion?.prompt,
        scores: t_opinion,
      },
      {
        key: "task3",
        label: "Storytelling",
        prompt: selectedPrompts.storytelling?.prompt,
        scores: t_story,
      },
    ];

    const avgOverall = Number(
      ((t_emotion.overall + t_opinion.overall + t_story.overall) / 3).toFixed(1)
    );
    const level =
      avgOverall >= 85
        ? "C1 — Advanced"
        : avgOverall >= 70
        ? "B2 — Upper Intermediate"
        : avgOverall >= 55
        ? "B1 — Intermediate"
        : "A2 or below";
    const status = avgOverall >= 60 ? "Passed" : "Needs Improvement";

    const jsonResult = {
      task1: {
        prompt: tasks[0].prompt,
        duration: "approx 45-90s",
        scores: tasks[0].scores,
        feedback:
          tasks[0].scores.overall >= 80
            ? "Excellent emotional expression and clarity."
            : tasks[0].scores.overall >= 60
            ? "Good expression; work on structure and grammar."
            : "Needs work: expand ideas and avoid long pauses.",
      },
      task2: {
        prompt: tasks[1].prompt,
        duration: "approx 60-120s",
        scores: tasks[1].scores,
        feedback:
          tasks[1].scores.overall >= 80
            ? "Strong reasoning and structure."
            : tasks[1].scores.overall >= 60
            ? "Good arguments; add transitions and examples."
            : "Focus on organization and clearer sentences.",
      },
      task3: {
        prompt: tasks[2].prompt,
        duration: "approx 90-150s",
        scores: tasks[2].scores,
        feedback:
          tasks[2].scores.overall >= 80
            ? "Great storytelling and vocabulary."
            : tasks[2].scores.overall >= 60
            ? "Nice ideas; reduce pauses and repetition."
            : "Work on flow and vocabulary variety.",
      },
      final_result: {
        average_score: avgOverall,
        level,
        status,
        unlocked_next_stage: avgOverall >= 70,
      },
    };

    setResultsJSON(jsonResult);
    setProgress(100);
    setStep("results");

    // confetti for unlocking or good score
    if (jsonResult.final_result.unlocked_next_stage) {
      confetti({ particleCount: 140, spread: 120, origin: { y: 0.6 } });
    }

    // OPTIONAL: Save results to backend
    // if (userEmail) {
    //   axios.post("/api/userProgress/save", { userEmail, module: "speaking-advanced", results: jsonResult });
    // }
  };

  // ---- Reset / Retry functions ----
  const retryCurrent = () => {
    setTranscripts((prev) => ({ ...prev, [currentPracticeKey]: "" }));
  };

  const resetAll = () => {
    setStep("video");
    setProgress(0);
    setMcqAnswers({});
    setMcqFeedback({});
    setSelectedPrompts({
      emotion: pickRandom(PROMPTS.emotion),
      realLife: pickRandom(PROMPTS.realLife),
      opinion: pickRandom(PROMPTS.opinion),
      storytelling: pickRandom(PROMPTS.storytelling),
    });
    setCurrentPracticeIndex(0);
    setTranscripts({
      quick: "",
      emotion: "",
      realLife: "",
      opinion: "",
      storytelling: "",
    });
    setResultsJSON(null);
    setRecording(false);
  };

  // ---- Copy JSON to clipboard ----
  const copyResultsJSON = () => {
    if (!resultsJSON) return;
    navigator.clipboard?.writeText(JSON.stringify(resultsJSON, null, 2));
    alert("Results JSON copied to clipboard");
  };

  // ---- Render UI ----
  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-slate-800">
            Speaking Advanced — Practice & Test
          </h1>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => resetAll()}
              className="px-3 py-1 bg-red-50 text-red-600 rounded"
            >
              Reset
            </button>
            <button
              onClick={() => setMenuOpen((m) => !m)}
              className="px-3 py-1 bg-gray-50 rounded"
            >
              Menu
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 bg-emerald-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">{progress}% completed</p>
        </div>

        {/* Steps */}
        {step === "video" && (
          <section>
            <h2 className="text-lg font-semibold mb-2">🎬 Lesson Video</h2>
            <div
              id={ytContainerId}
              className="w-full h-64 bg-black rounded mb-3"
            />
            <p className="text-sm text-gray-600 mb-3">
              Watch the full video to learn techniques. When ready, proceed to
              the MCQ quiz to unlock practice.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Optionally require MCQ: just go to mcq
                  setStep("mcq");
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded"
              >
                Next: MCQ Quiz ➜
              </button>
              <button
                onClick={() => {
                  setProgress((p) => Math.max(p, 10));
                  alert("You can also mark watched manually.");
                }}
                className="px-3 py-2 bg-gray-100 rounded"
              >
                Mark watched
              </button>
            </div>
          </section>
        )}

        {step === "mcq" && (
          <section>
            <h2 className="text-lg font-semibold mb-2">
              📝 Quiz — check comprehension
            </h2>
            <div className="space-y-4 mb-4">
              {MCQS.map((q, idx) => (
                <div key={idx} className="p-3 border rounded">
                  <p className="font-medium mb-2">{q.question}</p>
                  {q.options.map((opt) => (
                    <label key={opt} className="block cursor-pointer mb-1">
                      <input
                        type="radio"
                        name={`mcq-${idx}`}
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
                  {mcqFeedback[q.question] && (
                    <p className="text-sm mt-2">{mcqFeedback[q.question]}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={submitMCQ}
                className="px-4 py-2 bg-emerald-600 text-white rounded"
              >
                Submit & Unlock Practice
              </button>
              <button
                onClick={() => setStep("video")}
                className="px-4 py-2 bg-gray-100 rounded"
              >
                Back
              </button>
            </div>
          </section>
        )}

        {step === "practice" && (
          <section>
            <h2 className="text-lg font-semibold mb-2">
              🎤 Practice — Speak about prompts
            </h2>

            <div className="mb-4 p-4 border rounded">
              <p className="text-sm text-gray-600 mb-2">
                Prompt category: <strong>{currentPracticeKey}</strong>
              </p>
              <p className="italic mb-3">{currentPrompt?.prompt}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => speak(currentPrompt?.prompt)}
                  className="px-3 py-2 bg-sky-600 text-white rounded"
                >
                  ▶ Play Prompt
                </button>

                <button
                  onClick={startPracticeRecording}
                  className={`px-4 py-2 rounded text-white ${
                    recording ? "bg-red-500" : "bg-emerald-600"
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

                <button
                  onClick={retryPractice}
                  className="px-3 py-2 bg-gray-100 rounded"
                >
                  Retry
                </button>
                <button
                  onClick={nextPractice}
                  className="ml-auto px-3 py-2 bg-indigo-600 text-white rounded"
                >
                  Done →
                </button>
              </div>

              {transcripts[currentPracticeKey] && (
                <p className="mt-3 text-sm text-gray-700">
                  You said: <em>{transcripts[currentPracticeKey]}</em>
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCurrentPracticeIndex((i) => Math.max(0, i - 1));
                }}
                className="px-3 py-2 bg-gray-100 rounded"
              >
                Prev
              </button>
              <button
                onClick={() => {
                  setCurrentPracticeIndex((i) =>
                    Math.min(practiceOrder.length - 1, i + 1)
                  );
                }}
                className="px-3 py-2 bg-gray-100 rounded"
              >
                Next
              </button>
              <button
                onClick={() => {
                  computeResults();
                }}
                className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Compute Results
              </button>
            </div>
          </section>
        )}

        {step === "results" && resultsJSON && (
          <section>
            <h2 className="text-lg font-semibold mb-3">
              🧪 PRACTICE SESSION RESULTS
            </h2>

            <div className="grid gap-4 mb-4">
              <div className="p-3 bg-slate-50 rounded">
                <p className="font-semibold">📌 TASK 1 — Emotion Expression</p>
                <p className="text-sm italic">{resultsJSON.task1.prompt}</p>
                <p className="mt-1">
                  Score: <strong>{resultsJSON.task1.scores.overall}%</strong>
                </p>
                <p className="text-sm text-gray-600">
                  {resultsJSON.task1.feedback}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded">
                <p className="font-semibold">📌 TASK 2 — Opinion / Debate</p>
                <p className="text-sm italic">{resultsJSON.task2.prompt}</p>
                <p className="mt-1">
                  Score: <strong>{resultsJSON.task2.scores.overall}%</strong>
                </p>
                <p className="text-sm text-gray-600">
                  {resultsJSON.task2.feedback}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded">
                <p className="font-semibold">📌 TASK 3 — Storytelling</p>
                <p className="text-sm italic">{resultsJSON.task3.prompt}</p>
                <p className="mt-1">
                  Score: <strong>{resultsJSON.task3.scores.overall}%</strong>
                </p>
                <p className="text-sm text-gray-600">
                  {resultsJSON.task3.feedback}
                </p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded mb-4">
              <p className="font-bold">
                🎯 FINAL SCORE:{" "}
                <span className="text-xl">
                  {resultsJSON.final_result.average_score}%
                </span>
              </p>
              <p>
                LEVEL: <strong>{resultsJSON.final_result.level}</strong>
              </p>
              <p>
                STATUS: <strong>{resultsJSON.final_result.status}</strong>
              </p>
              <p>
                NEXT MODULE UNLOCKED:{" "}
                {resultsJSON.final_result.unlocked_next_stage
                  ? "✅ Yes"
                  : "❌ No"}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  copyResultsJSON();
                }}
                className="px-4 py-2 bg-sky-600 text-white rounded flex items-center gap-2"
              >
                <Clipboard size={16} /> Copy JSON
              </button>
              <button
                onClick={() => resetAll()}
                className="px-4 py-2 bg-gray-100 rounded"
              >
                Done / Restart
              </button>
            </div>
          </section>
        )}

        {/* If results ready but step not results show quick button */}
        {!resultsJSON && step === "results" && (
          <div>
            <p>No results yet. Press compute to evaluate.</p>
            <button
              onClick={() => computeResults()}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Compute Results
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
