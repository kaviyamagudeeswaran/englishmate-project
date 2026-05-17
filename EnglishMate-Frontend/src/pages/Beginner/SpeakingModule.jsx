import React, { useState, useEffect } from "react";
import { Mic, StopCircle, ChevronDown, ChevronUp } from "lucide-react";
import Confetti from "canvas-confetti";
import { useAuth } from "../../context/AuthContext";
export default function SpeakingModule() {
  const {
      user,
      fetchModuleProgress, // (userId, module) => {...}
      saveModuleProgress, // (userId, module, body) => {...}
      resetModuleProgress, // (userId, module) => {...}
    } = useAuth();
  
  const [showVideo, setShowVideo] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [quizUnlocked, setQuizUnlocked] = useState(false);
  const [userAnswer, setUserAnswer] = useState({});
  const [mcqFeedback, setMcqFeedback] = useState({});
  const [score, setScore] = useState(null);
  const [aiTopic, setAiTopic] = useState("");
  const [recording, setRecording] = useState(false);
  const [speechText, setSpeechText] = useState("");
  const [feedback, setFeedback] = useState("");
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [progressOpen, setProgressOpen] = useState(true);
  const [recognition, setRecognition] = useState(null);

  const practiceTopics = [
    "Introduce yourself",
    "Describe your favorite hobby",
    "Talk about your daily routine",
    "Describe your last vacation",
    "Explain your favorite food",
  ];

  const moduleData = {
    title: "Speaking Module",
    video: "https://youtu.be/-8e7iwmzgPA?si=WyUIDbGGcMD8rN5x?enablejsapi=1",
    mcqs: [
      {
        question: "Which sentence is grammatically correct?",
        options: ["I goes to school", "I go to school", "I going school"],
        answer: "I go to school",
      },
      {
        question: "Select the polite way to greet someone.",
        options: ["Hey!", "Good morning!", "Yo!"],
        answer: "Good morning!",
      },
    ],
  };

  // Convert YouTube share link to embed URL
  const videoId = moduleData.video.split("/").pop().split("?")[0];
  const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;

  // Load progress
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("speakingModule")) || {};
    setVideoWatched(saved.videoWatched || false);
    setQuizUnlocked(saved.quizUnlocked || false);
    setScore(saved.score || null);
    setPracticeCompleted(saved.practiceCompleted || false);
    setCompletionPercentage(saved.completionPercentage || 0);
  }, []);

  // Save progress
  useEffect(() => {
    const data = {
      videoWatched,
      quizUnlocked,
      score,
      practiceCompleted,
      completionPercentage,
    };
    localStorage.setItem("speakingModule", JSON.stringify(data));
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
    if (!showVideo || !moduleData.video) return;
    const player = new window.YT.Player("ytplayer", {
      events: {
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.ENDED) setVideoWatched(true);
        },
      },
    });
    return () => player.destroy();
  }, [showVideo]);

  const handleWatchClick = () => setShowVideo(true);
  const handleUnlockQuiz = () => setQuizUnlocked(true);

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
    if (correctCount === moduleData.mcqs.length) Confetti();
  };

  // 🎤 Start Speaking
  const handleStartSpeaking = () => {
    const topic =
      practiceTopics[Math.floor(Math.random() * practiceTopics.length)];
    setAiTopic(topic);
    setSpeechText("");
    setFeedback("");
    setRecording(true);

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition.");
      setRecording(false);
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = "en-US";
    recog.interimResults = false;
    recog.continuous = false;

    recog.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSpeechText(transcript);
      evaluateSpeech(transcript);
      setRecording(false);
    };

    recog.onerror = (event) => {
      alert("Speech recognition error. Please try again.");
      setRecording(false);
    };

    recog.start();
    setRecognition(recog);
  };

  // 🛑 Stop Speaking
  const handleStopSpeaking = () => {
    if (recognition) {
      recognition.stop();
      setRecording(false);
    }
  };

  const evaluateSpeech = (transcript) => {
    if (transcript.length > 10) {
      setFeedback("🎉 Excellent! Your pronunciation and clarity are great.");
      setPracticeCompleted(true);
      setCompletionPercentage(100);
      localStorage.setItem(
        "speakingModule",
        JSON.stringify({ completionPercentage: 100 })
      );
      Confetti();
    } else {
      setFeedback("🗣️ Try to speak more clearly or longer sentences.");
    }
  };

  const restartModule = () => {
    setShowVideo(false);
    setVideoWatched(false);
    setQuizUnlocked(false);
    setScore(null);
    setUserAnswer({});
    setMcqFeedback({});
    setPracticeCompleted(false);
    setCompletionPercentage(0);
    localStorage.removeItem("speakingModule");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="bg-teal-700 text-white p-4 rounded-lg text-center">
        <h1 className="text-3xl font-bold">
          Beginner Level - {moduleData.title}
        </h1>
      </header>

      {/* Progress Section */}
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

      {/* Main Module */}
      <div className="bg-white shadow-xl rounded-2xl p-6 mt-6 mx-auto max-w-3xl">
        {!showVideo ? (
          <div className="flex flex-col items-center text-center">
            <p className="text-lg mb-4">Click below to start the module.</p>
            <button
              onClick={handleWatchClick}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition"
            >
              Start Module
            </button>
          </div>
        ) : (
          <>
            {/* Video Section */}
            <div className="mb-6">
              <iframe
                id="ytplayer"
                width="100%"
                height="250"
                src={embedUrl} // <-- Fixed embed URL
                title={moduleData.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-xl mb-2"
              />
              {!videoWatched && (
                <p className="text-sm text-gray-500">
                  Watch full video to unlock quiz.
                </p>
              )}
              {videoWatched && !quizUnlocked && (
                <button
                  onClick={handleUnlockQuiz}
                  className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition"
                >
                  Unlock Quiz
                </button>
              )}
            </div>

            {/* Quiz Section */}
            {quizUnlocked && moduleData.mcqs.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-xl shadow mb-6">
                <h3 className="font-bold text-lg mb-4">Quiz</h3>
                {moduleData.mcqs.map((q, idx) => (
                  <div
                    key={idx}
                    className="mb-4 p-2 border rounded hover:bg-indigo-50 transition"
                  >
                    <p className="mb-2 font-semibold">{q.question}</p>
                    {q.options.map((opt) => (
                      <label key={opt} className="block cursor-pointer">
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
                        className={`mt-1 font-semibold ${
                          mcqFeedback[q.question].includes("Correct")
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

            {/* Practice Session */}
            {score === moduleData.mcqs.length && (
              <>
                {!practiceCompleted ? (
                  <div className="p-4 bg-gray-50 rounded-xl shadow text-center">
                    <h3 className="font-bold mb-4">🎤 Practice Session</h3>
                    <p className="mb-2 text-gray-600">
                      Speak on the topic below:
                    </p>
                    <p className="text-lg font-semibold text-teal-700 mb-4 animate-pulse">
                      {aiTopic || "Click Start Speaking to get a topic"}
                    </p>
                    <div className="flex justify-center gap-3 mb-4">
                      {!recording ? (
                        <button
                          onClick={handleStartSpeaking}
                          className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2 transition-all animate-bounce"
                        >
                          <Mic className="w-5 h-5" /> Start Speaking
                        </button>
                      ) : (
                        <button
                          onClick={handleStopSpeaking}
                          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 transition"
                        >
                          <StopCircle className="w-5 h-5" /> Stop Speaking
                        </button>
                      )}
                    </div>
                    {speechText && (
                      <p className="mt-3 text-gray-800 italic">
                        You said: “{speechText}”
                      </p>
                    )}
                    {feedback && (
                      <p className="mt-2 font-semibold text-green-700">
                        {feedback}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-6 bg-green-50 rounded-xl shadow text-center">
                    <h3 className="text-xl font-bold text-green-700 mb-2">
                      ✅ Module Completed!
                    </h3>
                    <p className="text-gray-700 mb-4">
                      You’ve successfully finished the Speaking Module.
                    </p>
                    <button
                      onClick={restartModule}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                    >
                      Restart Module
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
