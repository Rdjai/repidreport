import { Admin } from "../models/admin.model.js";
import Report from "../models/report.model.js";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req?.body;

    // 1. Check if fields are present
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
        success: false,
      });
    }

    // 2. Find admin by email and password
    const admin = await Admin.findOne({ email, password });
    if (!admin) {
      return res.status(401).json({
        message: "Invalid email or password.",
        success: false,
      });
    }

    // 3. Set session
    req.session.adminId = admin._id;
    req.session.admin = {
      id: admin._id,
      email: admin.email,
    };

    // 4. Success response
    return res.status(200).json({
      message: "Admin login successful ✅",
      success: true,
      admin: {
        id: admin._id,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Error during admin login:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const adminGetAllReport = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });

    // Add default values for missing fields
    const formattedReports = reports.map((report) => ({
      ...report.toObject(),
      status: report.status || "pending",
      priority:
        report.priority ||
        (report.reportType === "emergency" ? "high" : "medium"),
    }));

    return res.status(200).json({
      success: true,
      data: formattedReports,
      message: "Reports fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
    });
  }
};

// Update report status
export const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    if (!reportId || !status) {
      return res.status(400).json({
        message: "Report ID and status are required.",
        success: false,
      });
    }

    const validStatuses = ["pending", "in-progress", "resolved", "closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
        success: false,
      });
    }

    const report = await Report.findByIdAndUpdate(
      reportId,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({
        message: "Report not found.",
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Report status updated successfully",
      data: report,
    });
  } catch (error) {
    console.error("Error updating report status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update report status",
    });
  }
};

// Get single report by ID
export const getReportById = async (req, res) => {
  try {
    const { reportId } = req.params;

    if (!reportId) {
      return res.status(400).json({
        message: "Report ID is required.",
        success: false,
      });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        message: "Report not found.",
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      data: report,
      message: "Report fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch report",
    });
  }
};
