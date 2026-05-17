import User from "../models/User.js";

export const updateProfile = async (req, res) => {
  const userId = req.params.id; // make sure frontend sends correct user._id
  const { role, currentLevel, goals, preferences } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update fields
    user.role = role || user.role;
    user.currentLevel = currentLevel || user.currentLevel;
    user.goals = goals || user.goals;
    user.preferences = preferences || user.preferences;

    const updatedUser = await user.save(); // Save to MongoDB
    console.log("Profile updated:", updatedUser);

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
