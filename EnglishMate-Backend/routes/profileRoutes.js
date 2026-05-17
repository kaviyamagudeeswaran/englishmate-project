import express from "express";
import { updateProfile } from "../controllers/profileController.js";

const router = express.Router();

// PUT /api/profile/:id
router.put("/:id", updateProfile);

export default router;
