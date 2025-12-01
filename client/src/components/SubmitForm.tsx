import {useState, useRef, useCallback, useEffect} from "react";
import {MdLocationOn} from "react-icons/md";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {Label} from "./ui/label";
import {Input} from "./ui/input";
import {Button} from "./ui/button";
import {submitForm, analyzeImage} from "@/api/api";
import {toast} from "sonner";
import {useGeolocation} from "@/hooks/useGeoLocation";

import type {SubmitFormData} from "@/types";

const SubmitForm = () => {
  // Generate a unique report ID
  const generateReportID = useCallback(() => {
    const timestamp = Date.now().toString();
    const randomPart = Math.random().toString(36).substring(2, 15);
    const reportPrefix = "RPT";
    return `${reportPrefix}-${timestamp.slice(-8)}-${randomPart.toUpperCase()}`;
  }, []);

  const {
    loading: locationLoading,
    fetchLocation,
    getAddressFromCoordinates,
  } = useGeolocation();

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<SubmitFormData>({
    reportId: "",
    reportType: "",
    imageFile: null,
    imagePreview: null,
    incidentType: "",
    title: "",
    description: "",
    location: "",
  });

  // Generate report ID when component mounts
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      reportId: generateReportID(),
    }));
  }, [generateReportID]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Validation functions
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Report type validation
    if (!formData.reportType) {
      newErrors.reportType =
        "Please select a report type (Emergency or Non-Emergency)";
    }

    // Incident type validation
    if (!formData.incidentType) {
      newErrors.incidentType = "Please select an incident type";
    }

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Report title is required";
    } else if (formData.title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters long";
    } else if (formData.title.trim().length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Report description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters long";
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = "Description must be less than 1000 characters";
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    } else if (formData.location.trim().length < 3) {
      newErrors.location = "Location must be at least 3 characters long";
    }

    // Image validation (optional but if provided should be valid)
    if (formData.imageFile) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (formData.imageFile.size > maxSize) {
        newErrors.image = "Image file size must be less than 5MB";
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(formData.imageFile.type)) {
        newErrors.image = "Only JPEG, PNG, and WebP images are allowed";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Clear specific error when user starts typing
  const clearError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = {...prev};
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Handle location detection
  const handleGetLocation = async () => {
    try {
      toast.info("Getting your location...");
      const position = await fetchLocation();

      // Convert coordinates to address
      const address = await getAddressFromCoordinates(
        position.lat,
        position.lon
      );

      setFormData((prev) => ({
        ...prev,
        location: address,
      }));

      clearError("location");
      toast.success("Location detected successfully!");
    } catch (error) {
      console.error("Location error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to get location. Please enter manually.");
      }
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imageFile: file,
          imagePreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);

      // Trigger AI analysis
      await analyzeUploadedImage(file);
    }
  };

  const analyzeUploadedImage = async (file: File) => {
    setIsAnalyzing(true);
    toast.info("Analyzing image with AI");

    try {
      const response = await analyzeImage(file);
      const analysis = response.data.analysis;

      // Auto-fill form fields with AI analysis
      setFormData((prev) => ({
        ...prev,
        title: analysis.title || prev.title,
        description: analysis.description || prev.description,
      }));

      toast.success(
        "AI analysis complete Fields auto-filled (you can edit them)"
      );
    } catch (error) {
      console.error("Image analysis failed:", error);
      toast.error(
        "AI analysis failed, but you can still fill the form manually"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      imageFile: null,
      imagePreview: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Report ID copied to clipboard!");
    } catch (error: unknown) {
      toast.error(`Failed to copy to clipboard, ${error}`);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setSubmittedReportId("");
    setErrors({});
    setFormData({
      reportId: generateReportID(),
      reportType: "",
      imageFile: null,
      imagePreview: null,
      incidentType: "",
      title: "",
      description: "",
      location: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      toast.error("Please fix the errors in the form before submitting");
      return;
    }

    setIsLoading(true);
    try {
      const response = await submitForm(formData);
      toast.success(response.data.message);
      setSubmittedReportId(response.data.reportId);
      setIsSubmitted(true);
      setErrors({}); // Clear all errors on successful submission
    } catch (error: unknown) {
      if (error) {
        toast.error("Submission failed. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show success message if form is submitted
  if (isSubmitted) {
    return (
      <div className="mx-auto max-w-3xl px-5 border border-gray-200 rounded-2xl bg-white mb-10">
        <div className="py-10 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Report Submitted Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your report has been received and is being processed.
          </p>

          {/* Report ID Display */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Your Report ID
            </Label>
            <div className="flex items-center gap-2">
              <Input
                value={submittedReportId}
                readOnly
                className="flex-1 bg-white border-gray-300"
              />
              <Button
                type="button"
                onClick={() => copyToClipboard(submittedReportId)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Save this ID to track your report status
            </p>
          </div>

          {/* Submit Another Report Button */}
          <Button
            type="button"
            onClick={resetForm}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2"
          >
            Submit Another Report
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 border border-gray-200 rounded-2xl bg-white mb-10">
      <form className="" onSubmit={handleSubmit}>
        {/* report type */}
        <div className="py-5">
          <Label className="block mb-3 text-sm font-medium text-gray-700">
            Report Type <span className="text-red-500">*</span>
          </Label>
          <div className="flex justify-between items-center gap-4 flex-col sm:flex-row">
            {/* Emergency Box */}
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  reportType: "emergency",
                }));
                clearError("reportType");
              }}
              className={`border rounded-lg p-10 flex flex-col items-center gap-2 transition-all w-full focus:outline-none
            ${
              formData.reportType === "emergency"
                ? "border-red-500 ring-2 ring-red-200 bg-red-50"
                : "border-gray-200 bg-white hover:border-red-400"
            }`}
              aria-pressed={formData.reportType === "emergency"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-triangle-alert text-red-500 w-8 h-8"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>
                <path d="M12 9v4"></path>
                <path d="M12 17h.01"></path>
              </svg>
              <div className="flex flex-col items-center">
                <span className="font-semibold">Emergency</span>
                <p className="text-gray-500 text-sm">
                  Immediate Response Required
                </p>
              </div>
            </button>
            {/* Non-Emergency Box */}
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  reportType: "non-emergency",
                }));
                clearError("reportType");
              }}
              className={`border rounded-lg p-10 flex flex-col items-center gap-2 transition-all w-full focus:outline-none
            ${
              formData.reportType === "non-emergency"
                ? "border-orange-500 ring-2 ring-orange-200 bg-orange-50"
                : "border-gray-200 bg-white hover:border-orange-400"
            }`}
              aria-pressed={formData.reportType === "non-emergency"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-info text-orange-500 w-8 h-8"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
              <div className="flex flex-col items-center">
                <span className="font-semibold">Non Emergency</span>
                <p className="text-gray-500 text-sm">General Inquiry</p>
              </div>
            </button>
          </div>
          {errors.reportType && (
            <p className="text-red-500 text-sm mt-2">{errors.reportType}</p>
          )}
        </div>
        {/* image upload */}
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            id="image-upload"
            className="hidden"
            ref={fileInputRef}
            disabled={isAnalyzing}
          />
          <label
            htmlFor="image-upload"
            className={`border-2 px-8 py-8 w-full block rounded-lg border-dashed hover:border-red-400/50 hover:bg-red-400/10 cursor-pointer transition-all
            ${
              formData.imagePreview
                ? "border-red-400/50 bg-sky-400/10"
                : "border-gray-300"
            } ${isAnalyzing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {!formData.imagePreview ? (
              <div className="flex flex-col justify-center items-center space-y-4">
                <svg
                  className="w-11 h-11 text-zinc-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm text-zinc-400">
                  Drop an image here or click to upload
                </span>
                <span className="text-xs text-red-600 font-medium">
                  AI will automatically analyze and fill the form
                </span>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center relative">
                <div
                  className="absolute top-4 right-4 bg-zinc-600 p-1 rounded-full hover:bg-zinc-700 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                >
                  <svg
                    className="text-white w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <img
                  src={formData.imagePreview}
                  alt="Uploaded preview"
                  className="rounded-xl max-h-60 object-contain border border-gray-200"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                      <span className="text-sm">🤖 AI Analyzing...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </label>
          {errors.image && (
            <p className="text-red-500 text-sm mt-2">{errors.image}</p>
          )}
        </div>
        {/* Report Category Selector */}
        <div className="my-5">
          <Label htmlFor="incident-type" className="block mb-3">
            Incident Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.incidentType}
            onValueChange={(value) => {
              setFormData((prev) => ({...prev, incidentType: value}));
              clearError("incidentType");
            }}
          >
            <SelectTrigger className="border border-gray-300 rounded-md p-2 w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="border border-red-200 shadow-sm bg-white">
              <SelectItem value="theft">Theft</SelectItem>
              <SelectItem value="assault">Assault</SelectItem>
              <SelectItem value="safety-hazard">Medical Emergency</SelectItem>
              <SelectItem value="infrastructure">Infrastructure</SelectItem>
              <SelectItem value="environmental">Environmental</SelectItem>
              <SelectItem value="property">Property</SelectItem>
              <SelectItem value="traffic">Violence</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.incidentType && (
            <p className="text-red-500 text-sm mt-2">{errors.incidentType}</p>
          )}
        </div>
        {/* location section */}
        <div className="mb-5">
          <Label htmlFor="location" className="block mb-2">
            Location <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  location: e.target.value,
                }));
                clearError("location");
              }}
              placeholder="Enter the location or click to detect"
              className={`border rounded-md p-2 flex-1 ${
                errors.location ? "border-red-500" : "border-gray-300"
              }`}
            />
            <Button
              onClick={handleGetLocation}
              type="button"
              disabled={locationLoading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md flex items-center gap-2 whitespace-nowrap"
            >
              {locationLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  <span className="text-sm">Getting...</span>
                </>
              ) : (
                <>
                  <MdLocationOn className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
          {errors.location && (
            <p className="text-red-500 text-sm mt-2">{errors.location}</p>
          )}
        </div>
        {/* Report Title */}
        <div className="mb-5">
          <Label htmlFor="title" className="block mb-2">
            Report Title <span className="text-red-500">*</span>
            <span className="text-gray-500 text-sm font-normal">
              ({formData.title.length}/100)
            </span>
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                title: e.target.value,
              }));
              clearError("title");
            }}
            placeholder="Enter a brief title for your report"
            maxLength={100}
            className={`border rounded-md p-2 w-full ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-2">{errors.title}</p>
          )}
        </div>
        {/* Report Description */}
        <div className="mb-5">
          <Label htmlFor="description" className="block mb-2">
            Report Description <span className="text-red-500">*</span>
            <span className="text-gray-500 text-sm font-normal">
              ({formData.description.length}/1000)
            </span>
          </Label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }));
              clearError("description");
            }}
            rows={4}
            maxLength={1000}
            className={`w-full border rounded-md p-2 ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Provide a detailed description of the incident (minimum 10 characters)"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-2">{errors.description}</p>
          )}
        </div>
        {/* Report Submission */}
        <div className="mb-5">
          <Button
            type="submit"
            className="w-full bg-red-500 py-3 text-white hover:bg-red-600"
          >
            {isLoading ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SubmitForm;
