import {v2 as cloudinary} from "cloudinary";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_API,
  secure: true,
});

export const uploadOnCloudinary = async (fileUri) => {
  try {
    const result = await cloudinary.uploader.upload(fileUri.content, {
      resource_type: "auto",
      folder: "rapid-report",
    });
    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

export default cloudinary;
