// controllers/progressController.js
import Progress from "../models/Progress.js";

// Get user progress
export const getUserProgress = async (req, res) => {
  try {
    const { email } = req.params;
    const progress = await Progress.find({ email });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update or create progress
export const updateProgress = async (req, res) => {
  try {
    const {
      email,
      level,
      moduleType,
      watched,
      quizScore,
      practiceScore,
      completed,
    } = req.body;

    let progress = await Progress.findOne({ email, level, moduleType });

    if (!progress) {
      progress = new Progress({ email, level, moduleType });
    }

    if (watched !== undefined) progress.watched = watched;
    if (quizScore !== undefined) progress.quizScore = quizScore;
    if (practiceScore !== undefined) progress.practiceScore = practiceScore;
    if (completed !== undefined) progress.completed = completed;

    await progress.save();
    res.json({ message: "Progress updated", progress });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reset progress for a module
export const resetProgress = async (req, res) => {
  try {
    const { email, level, moduleType } = req.body;
    const progress = await Progress.findOne({ email, level, moduleType });

    if (!progress)
      return res.status(404).json({ message: "Progress not found" });

    progress.watched = false;
    progress.quizScore = 0;
    progress.practiceScore = 0;
    progress.completed = false;

    await progress.save();
    res.json({ message: "Module progress reset", progress });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
