import Report from "../models/report.model.js";
import cloudinary from "../utils/CloudinaryConfig.js";
import getDataUri from "../utils/dataUri.js";

export const submitReport = async (req, res) => {
  try {
    const { reportId, reportType, incidentType, title, description, location } =
      req.body;

    // Comprehensive validation with detailed error messages
    const errors = {};

    // Report ID validation
    if (
      !reportId ||
      typeof reportId !== "string" ||
      reportId.trim().length === 0
    ) {
      errors.reportId = "Report ID is required";
    }

    // Report type validation
    if (!reportType) {
      errors.reportType = "Report type is required";
    } else if (!["emergency", "non-emergency"].includes(reportType)) {
      errors.reportType =
        "Report type must be either 'emergency' or 'non-emergency'";
    }

    // Incident type validation
    if (
      !incidentType ||
      typeof incidentType !== "string" ||
      incidentType.trim().length === 0
    ) {
      errors.incidentType = "Incident type is required";
    }

    // Title validation
    if (!title || typeof title !== "string") {
      errors.title = "Title is required";
    } else {
      const trimmedTitle = title.trim();
      if (trimmedTitle.length === 0) {
        errors.title = "Title cannot be empty";
      } else if (trimmedTitle.length < 5) {
        errors.title = "Title must be at least 5 characters long";
      } else if (trimmedTitle.length > 100) {
        errors.title = "Title must be less than 100 characters";
      }
    }

    // Description validation
    if (!description || typeof description !== "string") {
      errors.description = "Description is required";
    } else {
      const trimmedDescription = description.trim();
      if (trimmedDescription.length === 0) {
        errors.description = "Description cannot be empty";
      } else if (trimmedDescription.length < 10) {
        errors.description = "Description must be at least 10 characters long";
      } else if (trimmedDescription.length > 1000) {
        errors.description = "Description must be less than 1000 characters";
      }
    }

    // Location validation
    if (!location || typeof location !== "string") {
      errors.location = "Location is required";
    } else {
      const trimmedLocation = location.trim();
      if (trimmedLocation.length === 0) {
        errors.location = "Location cannot be empty";
      } else if (trimmedLocation.length < 3) {
        errors.location = "Location must be at least 3 characters long";
      }
    }

    // Check if there are validation errors
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: "Validation errors occurred",
        success: false,
        errors: errors,
      });
    }

    // Image file validation
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        message: "Image file is required",
        success: false,
        errors: { image: "Please upload an image file" },
      });
    }

    // Validate image file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return res.status(400).json({
        message: "Image file too large",
        success: false,
        errors: { image: "Image file size must be less than 5MB" },
      });
    }

    // Validate image file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        message: "Invalid image format",
        success: false,
        errors: { image: "Only JPEG, PNG, and WebP images are allowed" },
      });
    }

    // Check for duplicate report ID
    const existingReport = await Report.findOne({ reportId });
    if (existingReport) {
      return res.status(400).json({
        message: "Report ID already exists",
        success: false,
        errors: {
          reportId: "This report ID is already in use. Please try again.",
        },
      });
    }

    // Convert buffer to Base64 for Cloudinary
    const fileUri = getDataUri(file);
    let cloudResponse;

    try {
      cloudResponse = await cloudinary.uploader.upload(fileUri.content);
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return res.status(500).json({
        message: "Failed to upload image",
        success: false,
        errors: { image: "Image upload failed. Please try again." },
      });
    }

    // Create the report with trimmed values
    const newReport = await Report.create({
      reportId: reportId.trim(),
      reportType,
      incidentType: incidentType.trim(),
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      image: cloudResponse.secure_url,
    });

    return res.status(201).json({
      reportId: newReport.reportId,
      message: "Report submitted successfully ✅",
      success: true,
    });
  } catch (error) {
    console.error("Error submitting report:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const findReportByReportId = async (req, res) => {
  try {
    const { reportId } = req.params;

    if (!reportId) {
      return res.status(400).json({
        message: "Report ID is required.",
        success: false,
      });
    }

    const report = await Report.findOne({ reportId: reportId });

    if (!report) {
      return res.status(404).json({
        message: "Report not found. Please check your Report ID and try again.",
        success: false,
      });
    }

    // Return limited information for public tracking (exclude sensitive admin data)
    const publicReportData = {
      reportId: report.reportId,
      reportType: report.reportType,
      incidentType: report.incidentType,
      title: report.title,
      description: report.description,
      location: report.location,
      status: report.status || "pending",
      priority:
        report.priority ||
        (report.reportType === "emergency" ? "high" : "medium"),
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };

    return res.status(200).json({
      message: "Report found successfully",
      success: true,
      data: publicReportData,
    });
  } catch (error) {
    console.error("Error finding report:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
