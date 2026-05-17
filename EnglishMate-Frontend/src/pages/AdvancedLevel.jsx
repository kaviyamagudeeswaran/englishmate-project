// import { useNavigate } from "react-router-dom";
// import { Zap, PlayCircle, Youtube } from "lucide-react";

// export default function AdvancedLevel() {
//   const navigate = useNavigate();

//   const advancedVideos = [
//     {
//       id: 1,
//       title: "Advanced English Writing",
//       description: "Improve your writing skills at advanced level.",
//       url: "https://www.youtube.com/watch?v=VIDEO_ID",
//     },
//     {
//       id: 2,
//       title: "Complex English Grammar",
//       description: "Master advanced grammar structures.",
//       url: "https://www.youtube.com/watch?v=VIDEO_ID",
//     },
//     {
//       id: 3,
//       title: "Advanced Vocabulary & Idioms",
//       description: "Learn sophisticated vocabulary and idioms.",
//       url: "https://www.youtube.com/watch?v=VIDEO_ID",
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
//       <nav className="bg-white border-b border-gray-200 shadow-sm">
//         <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between h-16">
//           <div className="flex items-center gap-2">
//             <Zap className="w-6 h-6 text-teal-600" />
//             <span className="text-xl font-bold text-teal-800">
//               English Mate
//             </span>
//           </div>
//           <button
//             onClick={() => navigate("/dashboard")}
//             className="text-teal-700 font-semibold hover:underline"
//           >
//             Dashboard
//           </button>
//         </div>
//       </nav>

//       <div className="max-w-5xl mx-auto px-6 py-12">
//         <div className="text-center mb-10">
//           <h1 className="text-4xl font-bold text-teal-800 mb-3">
//             Welcome to the Advanced Level 🎯
//           </h1>
//           <p className="text-gray-700 text-lg">
//             Learn advanced English skills with these curated lessons.
//           </p>
//         </div>

//         <div className="grid md:grid-cols-3 gap-8">
//           {advancedVideos.map((video) => (
//             <div
//               key={video.id}
//               className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition"
//             >
//               <div className="relative">
//                 <img
//                   src={`https://img.youtube.com/vi/${
//                     video.url.split("v=")[1]
//                   }/0.jpg`}
//                   alt={video.title}
//                   className="w-full h-48 object-cover"
//                 />
//                 <a
//                   href={video.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-50 transition"
//                 >
//                   <PlayCircle className="w-14 h-14 text-white" />
//                 </a>
//               </div>
//               <div className="p-6">
//                 <h3 className="text-lg font-bold text-teal-800 mb-2">
//                   {video.title}
//                 </h3>
//                 <p className="text-gray-600 mb-4">{video.description}</p>
//                 <a
//                   href={video.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="inline-flex items-center text-teal-600 hover:text-teal-800 font-semibold"
//                 >
//                   <Youtube className="w-5 h-5 mr-1" />
//                   Watch on YouTube
//                 </a>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
