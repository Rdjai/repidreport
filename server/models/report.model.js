import mongoose from "mongoose";

const reportSchema = mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
    },
    reportType: {
      type: String,
      required: true,
      enum: ["emergency", "non-emergency"],
    },
    image: {
      type: String,
      default: "",
    },
    incidentType: {
      type: String,
      required: [true, "Incident type is required"],
      trim: true,
      enum: {
        values: [
          "theft",
          "assault",
          "safety-hazard",
          "infrastructure",
          "environmental",
          "property",
          "traffic",
          "other",
        ],
        message: "Invalid incident type",
      },
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters long"],
      maxlength: [100, "Title must be less than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters long"],
      maxlength: [1000, "Description must be less than 1000 characters"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      minlength: [3, "Location must be at least 3 characters long"],
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved", "closed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: function () {
        return this.reportType === "emergency" ? "high" : "medium";
      },
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model("Report", reportSchema);

export default Report;
