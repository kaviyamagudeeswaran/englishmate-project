import express from "express";
import {
  addModuleContent,
  getModuleContent,
} from "../controllers/moduleContent.controller.js";

const router = express.Router();

router.post("/add", addModuleContent);
router.get("/:level/:moduleName", getModuleContent);

export default router;
