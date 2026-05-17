import User from "./models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ msg: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      msg: "Registered successfully",
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ msg: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      msg: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// UPDATE PROFILE  ✅ required for your frontend
export const updateUserProfile = async (req, res) => {
  try {
    const { email } = req.params;
    const updates = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: updates },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ msg: "User not found" });

    res.json({
      msg: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        ...updates,
      },
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
