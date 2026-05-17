// routes/progressRoutes.js
import express from "express";
import {
  getUserProgress,
  updateProgress,
  resetProgress,
} from "../controllers/progressController.js";

const router = express.Router();

router.get("/:email", getUserProgress);
router.post("/update", updateProgress);
router.post("/reset", resetProgress);

export default router;
