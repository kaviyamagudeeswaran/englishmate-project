// import React, { useState, useEffect } from "react";
// import { Ear, Mic, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
// import Confetti from "canvas-confetti";
// import axios from "axios";

// export default function Listening({ userEmail, onBack }) {
//   const [showVideo, setShowVideo] = useState(false);
//   const [videoWatched, setVideoWatched] = useState(false);
//   const [quizUnlocked, setQuizUnlocked] = useState(false);
//   const [userAnswer, setUserAnswer] = useState({});
//   const [mcqFeedback, setMcqFeedback] = useState({});
//   const [score, setScore] = useState(null);
//   const [practiceInput, setPracticeInput] = useState("");
//   const [recording, setRecording] = useState(false);
//   const [aiSentence, setAiSentence] = useState("");
//   const [completionPercentage, setCompletionPercentage] = useState(0);

//   const module = "intermediate-listening";

//   const moduleData = {
//     title: "Listening - Shadowing Practice",
//     video: "https://www.youtube.com/embed/jQCxy43FiOQ?si=p9z0qQniYLzm9t27",
//     mcqs: [
//       {
//         question: "What is the main topic discussed in the video?",
//         options: ["Communication", "Listening", "Pronunciation"],
//         answer: "Listening",
//       },
//       {
//         question: "What helps to improve pronunciation?",
//         options: ["Shadowing", "Reading", "Writing"],
//         answer: "Shadowing",
//       },
//     ],
//     practiceSentences: [
//       "Could you please repeat that?",
//       "That sounds interesting.",
//       "I didn’t catch that, could you say it again?",
//     ],
//   };

//   // ✅ Fetch user progress from backend
//   useEffect(() => {
//     axios
//       .get(`http://localhost:5000/api/progress/${userEmail}/${module}`)
//       .then((res) => {
//         const data = res.data;
//         if (data) {
//           setVideoWatched(data.videoWatched || false);
//           setQuizUnlocked(data.quizUnlocked || false);
//           setScore(data.score || null);
//           setCompletionPercentage(data.completionPercentage || 0);
//         }
//       })
//       .catch(() => {});
//   }, [userEmail]);

//   // ✅ Save progress to backend
//   const saveProgress = async () => {
//     try {
//       await axios.post("http://localhost:5000/api/userProgress/save", {
//         userEmail,
//         module,
//         progress: completionPercentage,
//         completed: completionPercentage === 100,
//       });
//     } catch (err) {
//       console.error("Save failed", err);
//     }
//   };

//   useEffect(() => {
//     saveProgress();
//   }, [videoWatched, quizUnlocked, score, completionPercentage]);

//   const handleWatchClick = () => setShowVideo(true);

//   const handleUnlockQuiz = () => setQuizUnlocked(true);

//   const handleMCQChange = (question, value) => {
//     setUserAnswer((prev) => ({ ...prev, [question]: value }));
//     const isCorrect =
//       value === moduleData.mcqs.find((q) => q.question === question).answer;
//     setMcqFeedback((prev) => ({
//       ...prev,
//       [question]: isCorrect ? "✅ Correct!" : "❌ Try again!",
//     }));
//   };

//   const handleSubmitMCQ = () => {
//     let correctCount = 0;
//     moduleData.mcqs.forEach((q) => {
//       if (userAnswer[q.question] === q.answer) correctCount++;
//     });
//     setScore(correctCount);
//     if (correctCount === moduleData.mcqs.length) {
//       setCompletionPercentage(60);
//       Confetti();
//     }
//   };

//   // 🎤 Shadowing Practice
//   const startShadowing = () => {
//     const sentence =
//       moduleData.practiceSentences[
//         Math.floor(Math.random() * moduleData.practiceSentences.length)
//       ];
//     setAiSentence(sentence);
//     const utterance = new SpeechSynthesisUtterance(sentence);
//     utterance.lang = "en-US";
//     speechSynthesis.speak(utterance);
//   };

//   const handleSpeechRecognition = () => {
//     if (!("webkitSpeechRecognition" in window)) {
//       alert("Your browser does not support speech recognition.");
//       return;
//     }
//     const recognition = new window.webkitSpeechRecognition();
//     recognition.lang = "en-US";
//     recognition.start();
//     setRecording(true);

//     recognition.onresult = (event) => {
//       const userSpeech = event.results[0][0].transcript;
//       setPracticeInput(userSpeech);
//       setRecording(false);

//       const similarity = compareSentences(aiSentence, userSpeech);
//       if (similarity > 0.8) {
//         Confetti();
//         setCompletionPercentage(100);
//         alert(`✅ Great job! Pronunciation ${(similarity * 100).toFixed(0)}%`);
//       } else {
//         alert(`🗣️ Try again! Pronunciation ${(similarity * 100).toFixed(0)}%`);
//       }
//     };
//   };

//   const compareSentences = (original, spoken) => {
//     const o = original.toLowerCase().split(" ");
//     const s = spoken.toLowerCase().split(" ");
//     const matches = o.filter((word) => s.includes(word)).length;
//     return matches / o.length;
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-4">
//       <button
//         onClick={onBack}
//         className="bg-gray-600 text-white px-3 py-2 rounded mb-4"
//       >
//         ← Back
//       </button>

//       <header className="bg-indigo-700 text-white p-4 rounded-lg text-center">
//         <h1 className="text-3xl font-bold">{moduleData.title}</h1>
//       </header>

//       {/* Progress */}
//       <div className="bg-white shadow p-4 flex justify-between items-center mt-4 rounded-lg max-w-4xl mx-auto">
//         <span className="font-semibold">Progress: {completionPercentage}%</span>
//       </div>

//       {/* Module */}
//       <div className="bg-white shadow-xl rounded-2xl p-6 mt-6 mx-auto max-w-3xl">
//         {!showVideo ? (
//           <div className="text-center">
//             <button
//               onClick={handleWatchClick}
//               className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
//             >
//               Start Module
//             </button>
//           </div>
//         ) : (
//           <>
//             <iframe
//               id="ytplayer"
//               width="100%"
//               height="250"
//               src={moduleData.video}
//               title="Intermediate Listening"
//               frameBorder="0"
//               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//               allowFullScreen
//               className="rounded-xl mb-4"
//               onEnded={() => setVideoWatched(true)}
//             />
//             {!videoWatched && (
//               <p className="text-sm text-gray-500">
//                 Watch the full video to unlock quiz.
//               </p>
//             )}
//             {videoWatched && !quizUnlocked && (
//               <button
//                 onClick={handleUnlockQuiz}
//                 className="bg-indigo-600 text-white px-4 py-2 rounded"
//               >
//                 Unlock Quiz
//               </button>
//             )}

//             {quizUnlocked && (
//               <div className="mt-6">
//                 <h3 className="font-bold text-lg mb-3">Quiz</h3>
//                 {moduleData.mcqs.map((q, idx) => (
//                   <div key={idx} className="mb-4">
//                     <p>{q.question}</p>
//                     {q.options.map((opt) => (
//                       <label key={opt} className="block cursor-pointer">
//                         <input
//                           type="radio"
//                           name={q.question}
//                           value={opt}
//                           onChange={(e) =>
//                             handleMCQChange(q.question, e.target.value)
//                           }
//                         />{" "}
//                         {opt}
//                       </label>
//                     ))}
//                     <p>{mcqFeedback[q.question]}</p>
//                   </div>
//                 ))}
//                 <button
//                   onClick={handleSubmitMCQ}
//                   className="bg-indigo-600 text-white px-4 py-2 rounded"
//                 >
//                   Submit
//                 </button>
//               </div>
//             )}

//             {score === moduleData.mcqs.length && (
//               <div className="mt-6">
//                 <h3 className="font-bold mb-3">🎤 Shadowing Practice</h3>
//                 <button
//                   onClick={startShadowing}
//                   className="bg-indigo-600 text-white px-4 py-2 rounded mr-2"
//                 >
//                   Play Sentence
//                 </button>
//                 <button
//                   onClick={handleSpeechRecognition}
//                   className={`px-4 py-2 rounded ${
//                     recording ? "bg-red-500" : "bg-green-600"
//                   } text-white`}
//                 >
//                   {recording ? "Listening..." : "Speak Now"}
//                 </button>
//                 {aiSentence && (
//                   <p className="mt-3 text-gray-700">
//                     Sentence: <strong>{aiSentence}</strong>
//                   </p>
//                 )}
//                 {practiceInput && (
//                   <p className="mt-2 text-gray-500">
//                     You said: <em>{practiceInput}</em>
//                   </p>
//                 )}
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
