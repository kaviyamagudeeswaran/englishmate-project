import UserProgress from "../models/UserProgress.js";

export const saveProgress = async (req, res) => {
  try {
    const { email, module, watched, quizScore, practiceScore, completed } =
      req.body;

    const progress = await UserProgress.findOneAndUpdate(
      { email, module },
      { watched, quizScore, practiceScore, completed },
      { new: true, upsert: true }
    );

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProgress = async (req, res) => {
  try {
    const { email, module } = req.params;
    const progress = await UserProgress.findOne({ email, module });

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
