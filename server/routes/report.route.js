import express from "express";
import {
  findReportByReportId,
  submitReport,
} from "../Controllers/report.controller.js";
import {
  analyzeImage,
  uploadMiddleware,
} from "../Controllers/image-analyze.controler.js";
import {multerUpload} from "../utils/multer.js";

const router = express.Router();

router.post("/submit-report", multerUpload, submitReport);

router.get("/track-report/:reportId", findReportByReportId);

router.post("/analyze-image", uploadMiddleware, analyzeImage);

export default router;
