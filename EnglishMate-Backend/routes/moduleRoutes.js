// backend/routes/moduleRoutes.js
import express from "express";
import {
  getModuleContent,
  saveProgress,
  getProgress,
  restartProgress,
} from "../controllers/moduleController.js";

const router = express.Router();

router.get("/content/:moduleName", getModuleContent);
router.post("/save", saveProgress);
router.get("/progress/:userId/:moduleName", getProgress);
router.post("/restart", restartProgress);

export default router;
