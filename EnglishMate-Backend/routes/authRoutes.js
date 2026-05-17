// routes/authRoutes.js
import express from "express";
import User from "../models/User.js"; // ensure filename is lowercase 'user.js'
import jwt from "jsonwebtoken";

const router = express.Router();

// ===============================
// REGISTER
// ===============================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const newUser = await User.create({ name, email, password });

    // create token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // return user and token
    res
      .status(201)
      .json({ message: "Registered successfully", user: newUser, token });
  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// LOGIN
// ===============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ message: "Login success", user, token });
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// UPDATE PROFILE
// ===============================
router.put("/update/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const updates = req.body;

    const user = await User.findOneAndUpdate({ email }, updates, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Profile updated", user });
  } catch (err) {
    console.log("PROFILE UPDATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
