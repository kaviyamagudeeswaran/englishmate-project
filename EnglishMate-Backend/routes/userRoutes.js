import express from "express";
import {
  registerUser,
  loginUser,
  updateProfile,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/update-profile/:id", updateProfile);

export default router;
