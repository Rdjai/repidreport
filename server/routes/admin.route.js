import express from "express";
import {
  adminGetAllReport,
  adminLogin,
  updateReportStatus,
  getReportById,
} from "../Controllers/admin.controler.js";
import {verifyAdmin} from "../Middlewares/adminMiddleweare.js";

const router = express.Router();

router.post("/admin-login", adminLogin);
router.get("/admin/reports", adminGetAllReport);
router.patch("/admin/reports/:reportId/status", updateReportStatus);
router.get("/admin/reports/:reportId", getReportById);

router.get("/admin/dashboard", verifyAdmin, (req, res) => {
  res.status(200).json({
    message: "Welcome to Admin Dashboard 🎉",
    admin: req.session.admin,
  });
});

export default router;
