// controllers/userProgress.controller.js
import UserRoutes from "../models/userRoutes.js";

// backend/controllers/userProgress.controller.js
// import UserProgress from "../models/userProgress.model.js";

/**
 * GET /api/userProgress/:email/:module
 */
export const getProgress = async (req, res) => {
  try {
    const { email, module } = req.params;
    if (!email || !module) return res.status(400).json({ message: "Missing params" });

    const doc = await UserProgress.findOne({ userEmail: email, module });
    return res.json(doc || {});
  } catch (err) {
    console.error("getProgress error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * POST /api/userProgress/save
 * Body expected: { userEmail, module, progress, completed, videoWatched, quizUnlocked, score, practiceCompleted, currentSentenceIndex, userAnswers, meta }
 */
export const saveProgress = async (req, res) => {
  try {
    const {
      userEmail,
      module,
      progress = 0,
      completed = false,
      videoWatched = false,
      quizUnlocked = false,
      score = 0,
      practiceCompleted = false,
      currentSentenceIndex = 0,
      userAnswers = {},
      meta = {},
    } = req.body;

    if (!userEmail || !module) return res.status(400).json({ message: "Missing userEmail or module" });

    const updated = await UserProgress.findOneAndUpdate(
      { userEmail, module },
      {
        userEmail,
        module,
        progress,
        completed,
        videoWatched,
        quizUnlocked,
        score,
        practiceCompleted,
        currentSentenceIndex,
        userAnswers,
        meta,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({ message: "Progress saved", data: updated });
  } catch (err) {
    console.error("saveProgress error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * POST /api/userProgress/restart
 * Body: { userEmail, module }
 */
export const restartProgress = async (req, res) => {
  try {
    const { userEmail, module } = req.body;
    if (!userEmail || !module) return res.status(400).json({ message: "Missing userEmail or module" });

    const updated = await UserProgress.findOneAndUpdate(
      { userEmail, module },
      {
        progress: 0,
        completed: false,
        videoWatched: false,
        quizUnlocked: false,
        score: 0,
        practiceCompleted: false,
        currentSentenceIndex: 0,
        userAnswers: {},
        meta: {},
      },
      { new: true }
    );

    return res.json({ message: "Progress reset", data: updated });
  } catch (err) {
    console.error("restartProgress error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
