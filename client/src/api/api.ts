import {REPORT_SUBMIT_ROUTE} from "@/utils/constants";
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

interface FormData {
  reportId: string;
  reportType: "emergency" | "non-emergency" | "";
  imageFile: File | null;
  imagePreview: string | null;
  incidentType: string;
  title: string;
  description: string;
  location: string;
}

export const submitForm = async (formData: FormData) => {
  const submitData = new FormData();

  submitData.append("reportId", formData.reportId);
  submitData.append("reportType", formData.reportType);
  submitData.append("incidentType", formData.incidentType);
  submitData.append("title", formData.title);
  submitData.append("description", formData.description);
  submitData.append("location", formData.location);

  if (formData.imageFile) {
    submitData.append("imageFile", formData.imageFile);
  }

  return await api.post(REPORT_SUBMIT_ROUTE, submitData, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const trackReportById = async (reportId: string) => {
  return await api.get(`/api/track-report/${reportId}`, {
    withCredentials: true,
  });
};

// admin login

export const adminLogin = async (email: string, password: string) => {
  return api.post("/api/admin-login", {email, password});
};

// Admin API functions
export const getAllReports = async () => {
  return await api.get("/api/admin/reports", {
    withCredentials: true,
  });
};

export const updateReportStatus = async (reportId: string, status: string) => {
  return await api.patch(
    `/api/admin/reports/${reportId}/status`,
    {status},
    {withCredentials: true}
  );
};

export const getReportById = async (reportId: string) => {
  return await api.get(`/api/admin/reports/${reportId}`, {
    withCredentials: true,
  });
};

export const analyzeImage = async (imageFile: File) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  return await api.post("/api/analyze-image", formData, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
