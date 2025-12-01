import {useState} from "react";
import {Button} from "../ui/button";
import {Input} from "../ui/input";
import {Label} from "../ui/label";
import {Badge} from "../ui/badge";
import {trackReportById} from "../../api/api";
import {toast} from "sonner";
import {AxiosError} from "axios";

interface ReportData {
  reportId: string;
  reportType: "emergency" | "non-emergency";
  incidentType: string;
  title: string;
  description: string;
  location: string;
  status: "pending" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  createdAt: string;
  updatedAt: string;
}

const TrackReport = () => {
  const [reportId, setReportId] = useState("");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleFindReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!reportId.trim()) {
      //
      toast.error("Please enter a report ID");
      return;
    }

    
    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await trackReportById(reportId.trim());
      if (response.data.success) {
        setReportData(response.data.data);
        toast.success("Report found successfully!");
      } else {
        setReportData(null);
        toast.error(response.data.message || "Report not found");
      }
    } catch (error) {
      console.error("Error tracking report:", error);
      setReportData(null);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Report not found");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getReportTypeColor = (type: string) => {
    return type === "emergency"
      ? "bg-red-100 text-red-800 border-red-200"
      : "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <svg
            className="w-5 h-5 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "in-progress":
        return (
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        );
      case "resolved":
        return (
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "closed":
        return (
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        );
      default:
        return null;
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-20 h-fit">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Show header and search form only when no report is displayed */}
        {!reportData && (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
                Track Your Report
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Enter your report ID to check the current status and get updates
                on your submission
              </p>
            </div>

            {/* Search Form */}
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100">
              <form className="space-y-6" onSubmit={handleFindReport}>
                <div>
                  <Label
                    htmlFor="reportId"
                    className="block font-semibold text-gray-900 mb-3"
                  >
                    Report ID
                  </Label>
                  <div className="relative">
                    <Input
                      type="text"
                      id="reportId"
                      value={reportId}
                      onChange={(e) => setReportId(e.target.value)}
                      placeholder="Enter your report ID"
                      className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                      disabled={isLoading}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-md font-semibold hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Searching...
                    </div>
                  ) : (
                    "Track Report"
                  )}
                </Button>
              </form>
            </div>
          </>
        )}

        {/* Show "Report Not Found" message when searched but no report found */}
        {hasSearched && !isLoading && !reportData && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Report Not Found
              </h3>
              <p className="text-gray-600 mb-6">
                We couldn't find a report with the ID "{reportId}". Please check
                the ID and try again.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="font-medium text-blue-900 mb-2">
                  Tips for finding your report:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Make sure you've entered the complete Report ID</li>
                  <li>• Report IDs are case-sensitive</li>
                  <li>• Check for any extra spaces or characters</li>
                </ul>
              </div>
              <Button
                onClick={() => {
                  setHasSearched(false);
                  setReportId("");
                }}
                className="mt-6 bg-red-600 text-white hover:bg-red-700"
              >
                Try Another Search
              </Button>
            </div>
          </div>
        )}

        {/* Show report card when report is found */}
        {reportData && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {reportData ? (
              <div className="p-8">
                {/* Report Header */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {reportData.title}
                    </h2>
                    <p className="text-gray-600 font-medium">
                      {reportData.reportId}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(reportData.status)}
                    <Badge className={getStatusColor(reportData.status)}>
                      {reportData.status.charAt(0).toUpperCase() +
                        reportData.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Report Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Report Type
                      </label>
                      <Badge
                        className={getReportTypeColor(reportData.reportType)}
                      >
                        {reportData.reportType === "emergency"
                          ? "Emergency"
                          : "Non-Emergency"}
                      </Badge>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority Level
                      </label>
                      <Badge className={getPriorityColor(reportData.priority)}>
                        {reportData.priority.charAt(0).toUpperCase() +
                          reportData.priority.slice(1)}
                      </Badge>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Incident Type
                      </label>
                      <p className="text-gray-900 capitalize">
                        {reportData.incidentType.replace("-", " ")}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <p className="text-gray-900">{reportData.location}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Submitted
                      </label>
                      <p className="text-gray-900">
                        {new Date(reportData.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Updated
                      </label>
                      <p className="text-gray-900">
                        {new Date(reportData.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Report Description */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Report Description
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {reportData.description}
                    </p>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Status Timeline
                  </h3>
                  <div className="space-y-3">
                    <div
                      className={`flex items-center space-x-3 ${
                        reportData.status === "pending"
                          ? "text-yellow-700"
                          : "text-gray-500"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${
                          reportData.status === "pending"
                            ? "bg-yellow-500 animate-pulse"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      <span className="font-medium">Report Submitted</span>
                      <span className="text-sm">
                        ({new Date(reportData.createdAt).toLocaleDateString()})
                      </span>
                    </div>

                    <div
                      className={`flex items-center space-x-3 ${
                        reportData.status === "in-progress"
                          ? "text-blue-700"
                          : reportData.status === "resolved" ||
                            reportData.status === "closed"
                          ? "text-gray-500"
                          : "text-gray-400"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${
                          reportData.status === "in-progress"
                            ? "bg-blue-500 animate-pulse"
                            : reportData.status === "resolved" ||
                              reportData.status === "closed"
                            ? "bg-gray-300"
                            : "bg-gray-200"
                        }`}
                      ></div>
                      <span className="font-medium">Under Investigation</span>
                      {(reportData.status === "in-progress" ||
                        reportData.status === "resolved" ||
                        reportData.status === "closed") && (
                        <span className="text-sm">
                          ({new Date(reportData.updatedAt).toLocaleDateString()}
                          )
                        </span>
                      )}
                    </div>

                    <div
                      className={`flex items-center space-x-3 ${
                        reportData.status === "resolved"
                          ? "text-green-700"
                          : reportData.status === "closed"
                          ? "text-gray-500"
                          : "text-gray-400"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${
                          reportData.status === "resolved"
                            ? "bg-green-500"
                            : reportData.status === "closed"
                            ? "bg-gray-300"
                            : "bg-gray-200"
                        }`}
                      ></div>
                      <span className="font-medium">Resolved</span>
                      {reportData.status === "resolved" && (
                        <span className="text-sm">
                          ({new Date(reportData.updatedAt).toLocaleDateString()}
                          )
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="flex justify-center items-center w-full py-5">
              <Button
                className="w-[90%] bg-red-500 hover:bg-red-700 text-white cursor-pointer"
                onClick={() => {
                  setReportData(null);
                  setReportId("");
                  setHasSearched(false);
                }}
                variant="outline"
              >
                Search Another Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackReport;
