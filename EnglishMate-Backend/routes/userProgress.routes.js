import express from "express";
import {
  saveProgress,
  getProgress,
} from "../controllers/userProgress.controller.js";

const router = express.Router();

router.post("/save", saveProgress);
router.get("/:email/:module", getProgress);

export default router;
