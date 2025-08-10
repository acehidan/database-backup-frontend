import React, { useState } from "react";
import {
  Database,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface BackupConfig {
  name: string;
  databaseType: string;
  databaseUrl: string;
  targetDatabaseName: string;
  schedule: string;
}

interface FormErrors {
  [key: string]: string;
}

const CreateBackupForm: React.FC = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<BackupConfig>({
    name: "",
    databaseType: "mongodb",
    databaseUrl: "",
    targetDatabaseName: "",
    schedule: "manual",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );
  const [statusMessage, setStatusMessage] = useState("");

  const databaseTypes = [
    { value: "mongodb", label: "MongoDB" },
    { value: "mysql", label: "MySQL" },
    { value: "postgresql", label: "PostgreSQL" },
    { value: "redis", label: "Redis" },
  ];

  const scheduleOptions = [
    { value: "manual", label: "Manual" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!config.name.trim()) {
      newErrors.name = "Configuration name is required";
    }

    if (!config.databaseUrl.trim()) {
      newErrors.databaseUrl = "Database URL is required";
    } else if (
      config.databaseType === "mongodb" &&
      !config.databaseUrl.includes("mongodb")
    ) {
      newErrors.databaseUrl =
        "Please provide a valid MongoDB connection string";
    }

    if (!config.targetDatabaseName.trim()) {
      newErrors.targetDatabaseName = "Target database name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof BackupConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API}api/v1/backup-config`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(config),
          // Add timeout
          signal: AbortSignal.timeout(10000), // 10 second timeout
        }
      );

      if (response.ok) {
        setSubmitStatus("success");
        setStatusMessage("Backup configuration created successfully!");
        // Reset form
        setConfig({
          name: "",
          databaseType: "mongodb",
          databaseUrl: "",
          targetDatabaseName: "",
          schedule: "manual",
        });

        navigate("/");
      } else {
        const errorText = await response.text();
        throw new Error(
          `Server responded with status ${response.status}: ${
            errorText || response.statusText
          }`
        );
      }
    } catch (error) {
      setSubmitStatus("error");
      console.error("Error creating backup config:", error);

      if (error instanceof Error) {
        if (error.name === "TimeoutError") {
          setStatusMessage(
            "Request timed out. Please check your connection and try again."
          );
        } else if (error.message.includes("Failed to fetch")) {
          setStatusMessage(
            "Unable to connect to the backup service. Please check if the service is running and try again."
          );
        } else {
          setStatusMessage(
            `Failed to create backup configuration: ${error.message}`
          );
        }
      } else {
        setStatusMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors duration-200 space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>

              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                <Database className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Create Backup Configuration
              </h1>
              <p className="text-gray-600">
                Set up automated backups for your databases with ease
              </p>
            </div>
          </div>

          {/* Status Messages */}
          {submitStatus && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
                submitStatus === "success"
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              {submitStatus === "success" ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="font-medium">{statusMessage}</span>
            </div>
          )}

          {/* Main Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <h2 className="text-xl font-semibold text-white">
                Backup Configuration Details
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Configuration Name */}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Configuration Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={config.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 bg-gray-50 focus:bg-white"
                  }`}
                  placeholder="e.g., Production MongoDB Backup"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* Database Type */}
              <div className="space-y-2">
                <label
                  htmlFor="databaseType"
                  className="block text-sm font-medium text-gray-700"
                >
                  Database Type
                </label>
                <select
                  id="databaseType"
                  value={config.databaseType}
                  onChange={(e) =>
                    handleInputChange("databaseType", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
                >
                  {databaseTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Database URL */}
              <div className="space-y-2">
                <label
                  htmlFor="databaseUrl"
                  className="block text-sm font-medium text-gray-700"
                >
                  Database Connection URL
                </label>
                <textarea
                  id="databaseUrl"
                  value={config.databaseUrl}
                  onChange={(e) =>
                    handleInputChange("databaseUrl", e.target.value)
                  }
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                    errors.databaseUrl
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 bg-gray-50 focus:bg-white"
                  }`}
                  placeholder="e.g., mongodb+srv://username:password@cluster.mongodb.net/"
                />
                {errors.databaseUrl && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.databaseUrl}</span>
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Ensure your connection string includes authentication
                  credentials
                </p>
              </div>

              {/* Target Database Name */}
              <div className="space-y-2">
                <label
                  htmlFor="targetDatabaseName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Target Database Name
                </label>
                <input
                  type="text"
                  id="targetDatabaseName"
                  value={config.targetDatabaseName}
                  onChange={(e) =>
                    handleInputChange("targetDatabaseName", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.targetDatabaseName
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 bg-gray-50 focus:bg-white"
                  }`}
                  placeholder="e.g., production_db"
                />
                {errors.targetDatabaseName && (
                  <p className="text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.targetDatabaseName}</span>
                  </p>
                )}
              </div>

              {/* Schedule */}
              <div className="space-y-2">
                <label
                  htmlFor="schedule"
                  className="block text-sm font-medium text-gray-700"
                >
                  Backup Schedule
                </label>
                <select
                  id="schedule"
                  value={config.schedule}
                  onChange={(e) =>
                    handleInputChange("schedule", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
                >
                  {scheduleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex space-x-4">
                <Link
                  to="/"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-lg transition-all duration-200 text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Create Configuration</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Info Card */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Important Notes
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  Ensure your database connection URL is accessible from our
                  backup servers
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  Manual backups can be triggered on-demand from your dashboard
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>All backup data is encrypted and stored securely</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBackupForm;
