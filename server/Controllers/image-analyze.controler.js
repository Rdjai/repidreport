import {GoogleGenAI} from "@google/genai";
import multer from "multer";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Multer configuration for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

export const uploadMiddleware = upload.single("image");

export const analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({error: "No image file provided"});
    }

    // Convert image buffer to base64
    const base64Data = req.file.buffer.toString("base64");

    // Improved prompt for more accurate analysis
    const prompt = `You are an expert emergency response analyzer. Examine this image very carefully and identify any incidents, emergencies, or safety concerns.

Look specifically for:
- Accidents (vehicle crashes, falls, collisions)
- Medical emergencies (injuries, unconscious people, medical situations)
- Fires or smoke
- Criminal activities (theft, vandalism, assault)
- Natural disasters (flooding, storm damage, earthquakes)
- Infrastructure problems (broken pipes, electrical hazards, structural damage)
- Violence or conflicts between people
- Traffic incidents
- Environmental hazards

Respond in this EXACT format without any additional text:
TITLE: [Write a precise 3-5 word title describing what you see]
TYPE: [Choose EXACTLY one: Theft, Medical Emergency, Fire Outbreak, Natural Disaster, Violence, Infrastructure, Traffic, Other]
DESCRIPTION: [In 1-2 sentences, describe specifically what emergency or incident you observe in the image. Be factual and detailed.]

If you don't see any clear emergency or incident, respond with:
TITLE: General Report
TYPE: Other
DESCRIPTION: No clear emergency or incident visible in the image.`;

    // Generate content using the new API format with image
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: req.file.mimetype,
          },
        },
      ],
    });

    const text = response.text;

    const titleMatch = text.match(/TITLE:\s*(.+)/); // Extract title
    const typeMatch = text.match(/TYPE:\s*(.+)/); // Extract type
    const descMatch = text.match(/DESCRIPTION:\s*(.+)/); // Extract description

    const analysisData = {
      title: titleMatch?.[1]?.trim() || "Incident Report",
      description: descMatch?.[1]?.trim() || "Please review and add details.",
    };

    res.status(200).json({
      success: true,
      analysis: analysisData,
      message: "Image analyzed successfully",
    });
  } catch (error) {
    console.error("Image analysis error:", error);
    res.status(500).json({
      error: "Failed to analyze image",
      details: error.message,
    });
  }
};
