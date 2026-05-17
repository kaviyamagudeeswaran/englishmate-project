// src/pages/Assessment.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Zap, CheckCircle, Mic, StopCircle } from "lucide-react";

const PARAGRAPHS = [
  {
    id: 1,
    title: "The Beauty of Nature",
    content:
      "Nature is full of wonders. Trees, rivers, and mountains provide us with beauty and resources. We must protect it for future generations.",
  },
  {
    id: 2,
    title: "Learning a Language",
    content:
      "Learning a new language opens doors to new cultures and experiences. Consistent practice improves vocabulary, grammar, and confidence in speaking.",
  },
  {
    id: 3,
    title: "Technology in Education",
    content:
      "Technology has transformed education. Online resources and interactive tools help students learn faster and more effectively than ever before.",
  },
];

export default function Assessment() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("welcome");
  const [paragraph, setParagraph] = useState(null);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const startAssessment = () => {
    const random = PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)];
    setParagraph(random);
    setStep("record");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunksRef.current.push(event.data);
      });

      mediaRecorder.addEventListener("stop", () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(blob);
        setStep("review");
      });

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Microphone access denied", err);
      alert("Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const submitAudio = async () => {
    if (!audioBlob) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", audioBlob); // must match backend multer field
      formData.append("userId", user?.email || "anonymous");

      const res = await fetch("http://localhost:5000/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error: ${text}`);
      }

      const data = await res.json();
      setTranscription(data.transcription);
      setFeedback(data.feedback);

      // Play ElevenLabs TTS audio
      if (data.feedback.ttsAudio) {
        const audio = new Audio(
          `data:audio/wav;base64,${data.feedback.ttsAudio}`
        );
        audio.play();
      }

      setStep("result");
    } catch (err) {
      console.error("Error sending audio:", err);
      alert(
        "Failed to send audio. Check backend is running and API key is valid."
      );
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setStep("welcome");
    setParagraph(null);
    setAudioBlob(null);
    setTranscription("");
    setFeedback(null);
    setRecording(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 flex flex-col items-center p-4">
      <nav className="w-full bg-white shadow-md border-b border-gray-200 mb-8">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-teal-600" />
          <span className="text-xl font-bold text-teal-800">English Mate</span>
        </div>
      </nav>

      {/* Welcome Step */}
      {step === "welcome" && (
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xl text-center">
          <h1 className="text-3xl font-bold text-teal-800 mb-4">
            Reading Assessment
          </h1>
          <p className="text-gray-600 mb-6">
            You will read a random paragraph aloud. We will evaluate your
            pronunciation and grammar.
          </p>
          <button
            onClick={startAssessment}
            className="bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 transition"
          >
            Start Assessment
          </button>
        </div>
      )}

      {/* Record Step */}
      {step === "record" && paragraph && (
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xl text-center">
          <h2 className="text-2xl font-bold text-teal-800 mb-4">
            {paragraph.title}
          </h2>
          <p className="text-gray-700 mb-6">{paragraph.content}</p>
          {recording ? (
            <button
              onClick={stopRecording}
              className="bg-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2 mx-auto"
            >
              <StopCircle className="w-5 h-5" /> Stop Recording
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 transition flex items-center justify-center gap-2 mx-auto"
            >
              <Mic className="w-5 h-5" /> Start Recording
            </button>
          )}
        </div>
      )}

      {/* Review Step */}
      {step === "review" && audioBlob && (
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xl text-center">
          <h2 className="text-2xl font-bold text-teal-800 mb-4">
            Review & Submit
          </h2>
          <audio controls className="mb-6 w-full">
            <source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
          </audio>
          <div className="flex gap-4 justify-center">
            <button
              onClick={submitAudio}
              disabled={loading}
              className="bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 transition"
            >
              {loading ? "Processing..." : "Submit"}
            </button>
            <button
              onClick={restart}
              className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Record Again
            </button>
          </div>
        </div>
      )}

      {/* Result Step */}
      {step === "result" && feedback && (
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xl text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-teal-800 mb-4">Results</h2>

          <p className="text-gray-700 mb-2">
            <span className="font-semibold">Your transcription:</span> "
            {transcription}"
          </p>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">Corrected:</span> "
            {feedback.correctedText}"
          </p>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">Pronunciation Score:</span>{" "}
            {feedback.pronunciationScore}%
          </p>
          {feedback.suggestions && (
            <p className="text-gray-700 mb-4">
              <span className="font-semibold">Suggestions:</span>{" "}
              {feedback.suggestions.join(", ")}
            </p>
          )}

          <button
            onClick={restart}
            className="bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 transition"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
} 