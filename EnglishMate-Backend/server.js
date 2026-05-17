import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Routes
import userProgressRoutes from "./routes/userProgress.routes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import moduleContentRoutes from "./routes/moduleContent.routes.js";
import progressRoutes from "./routes/progressRoutes.js";

// ----------------------
// CONFIG
// ----------------------
dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ----------------------
// CORS CONFIG (FIXED)
// ----------------------
const allowedOrigins = [
  "http://localhost:5173", // Vite frontend
  "http://localhost:3000",
  "https://englishmate-frontend.onrender.com", // add your deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed: " + origin));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// ✅ Handle preflight requests
// app.options("/*", cors());

// ----------------------
// MIDDLEWARE
// ----------------------
app.use(express.json());

// ----------------------
// ROUTES
// ----------------------
app.use("/api/module", moduleContentRoutes);
app.use("/api/progress", userProgressRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/users", userRoutes);
app.use("/api", progressRoutes);

// ----------------------
// TEST ROUTE
// ----------------------
app.get("/", (req, res) => {
  res.send("Server is running successfully 🚀");
});

// ----------------------
// 404 HANDLER
// ----------------------
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ----------------------
// GLOBAL ERROR HANDLER
// ----------------------
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.message || err);

  res.status(500).json({
    message: "Server error",
    error: err.message,
  });
});

// ----------------------
// START SERVER
// ----------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
