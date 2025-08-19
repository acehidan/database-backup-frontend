import React, { useState, useEffect } from "react";
import {
  Database,
  Edit,
  Play,
  Trash2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Settings,
  Calendar,
  Globe,
  Server,
  Download,
  Eye,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import axios from "axios";

interface BackupConfig {
  id: string;
  name: string;
  databaseType: string;
  databaseUrl: string;
  targetDatabaseName: string;
  schedule: string;
  status?: "active" | "inactive" | "error";
  lastBackup?: string;
  createdAt?: string;
}

interface BackupLog {
  _id: string;
  backupConfigId: string;
  name: string;
  fileName: string;
  url: string | null;
  spaceKey: string | null;
  size: number;
  status: "success" | "failed" | "pending";
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

const BackupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [config, setConfig] = useState<BackupConfig | null>(null);
  const [logs, setLogs] = useState<BackupLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchConfig = async () => {
    if (!id) return;

    const response = await axios.get(
      `${import.meta.env.VITE_APP_API}api/v1/backup-config/all`
    );
    console.log(response);
    if (response.status === 200) {
      console.log("Backup configuration found");
      setLoading(false);
      const config = response.data.backupConfigs.find(
        (config: BackupConfig) => config._id === id
      );
      console.log(config);
      setConfig(config);
      setName(config?.name);
      //   fetchLogs();
    } else {
      setError("Backup configuration not found");
    }
    // setConfig(response.data.backupConfigs.find((config) => config._id === id));
  };

  const fetchLogs = async () => {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_API}api/v1/backup-file/all`
    );
    console.log("backup logs", response.data.backupFiles);
    if (response.status === 200) {
      console.log("Backup configuration found");
      console.log("backname", response.data.backupFiles[0].name);
      setLoading(false);
      console.log(name);
      const log = response.data.backupFiles.filter(
        (log: BackupLog) => log.name === name
      );
      console.log("log", log);
      //   console.log(log);
      setLogs(log);
      setLogsLoading(false);
    } else {
      setError("Backup configuration not found");
    }

    // setConfig(response.data.backupConfigs.find((config) => config._id === id));
  };

  //   const getDatabaseTypeColor = (type: string) => {
  //     const colors = {
  //       mongodb: "bg-green-100 text-green-800 border-green-200",
  //       mysql: "bg-blue-100 text-blue-800 border-blue-200",
  //       postgresql: "bg-purple-100 text-purple-800 border-purple-200",
  //       redis: "bg-red-100 text-red-800 border-red-200",
  //     };
  //     return (
  //       colors[type as keyof typeof colors] ||
  //       "bg-gray-100 text-gray-800 border-gray-200"
  //     );
  //   };

  //   const getScheduleColor = (schedule: string) => {
  //     const colors = {
  //       manual: "bg-gray-100 text-gray-800 border-gray-200",
  //       daily: "bg-blue-100 text-blue-800 border-blue-200",
  //       weekly: "bg-indigo-100 text-indigo-800 border-indigo-200",
  //       monthly: "bg-purple-100 text-purple-800 border-purple-200",
  //     };
  //     return (
  //       colors[schedule as keyof typeof colors] ||
  //       "bg-gray-100 text-gray-800 border-gray-200"
  //     );
  //   };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "pending":
        return <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  useEffect(() => {
    name && fetchLogs();
  }, [name]);

  useEffect(() => {
    fetchConfig();
  }, [id]);

  const handleRunBackup = async () => {
    if (!config) return;

    setActionLoading("run");
    try {
      const response = await fetch(
        `https://databasebackupsystem.dns.army/api/v1/backup-config/${config.id}/run`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(30000),
        }
      );

      if (response.ok) {
        alert(
          "Backup started successfully! You can check the status in the backup logs."
        );
      } else {
        const errorText = await response.text();
        throw new Error(
          `Server responded with status ${response.status}: ${
            errorText || response.statusText
          }`
        );
      }
    } catch (error) {
      console.error("Error running backup:", error);
      let errorMessage =
        "An unexpected error occurred while starting the backup.";

      if (error instanceof Error) {
        if (error.name === "TimeoutError") {
          errorMessage =
            "The backup request timed out. The backup may still be running in the background.";
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage =
            "Unable to connect to the backup service. Please check if the service is running.";
        } else {
          errorMessage = `Failed to start backup: ${error.message}`;
        }
      }

      alert(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConfig = async () => {
    if (!config) return;

    setActionLoading("delete");
    try {
      // Simulate API call for deletion
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Backup configuration deleted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error deleting config:", error);
      alert("Failed to delete backup configuration. Please try again.");
    } finally {
      setActionLoading(null);
      setShowDeleteModal(false);
    }
  };

  const getDatabaseTypeColor = (type: string) => {
    const colors = {
      mongodb: "bg-green-100 text-green-800 border-green-200",
      mysql: "bg-blue-100 text-blue-800 border-blue-200",
      postgresql: "bg-purple-100 text-purple-800 border-purple-200",
      redis: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      colors[type as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const getScheduleColor = (schedule: string) => {
    const colors = {
      manual: "bg-gray-100 text-gray-800 border-gray-200",
      daily: "bg-blue-100 text-blue-800 border-blue-200",
      weekly: "bg-indigo-100 text-indigo-800 border-indigo-200",
      monthly: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return (
      colors[schedule as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  Loading backup configuration...
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !config) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Configuration Not Found
              </h1>
              <p className="text-gray-600 mb-6">
                {error ||
                  "The requested backup configuration could not be found."}
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link
                to="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors duration-200 space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                    <Database className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {config.name}
                    </h1>
                    <p className="text-gray-600">
                      Backup Configuration Details
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleRunBackup}
                    disabled={actionLoading === "run"}
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed space-x-2"
                  >
                    {actionLoading === "run" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    <span>Run Backup</span>
                  </button>

                  <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 space-x-2">
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 gap-8">
              {/* Configuration Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                    <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                      <Settings className="w-5 h-5" />
                      <span>Configuration Details</span>
                    </h2>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Configuration Name
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {config.name}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Database Type
                        </label>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getDatabaseTypeColor(
                            config.databaseType
                          )}`}
                        >
                          {config.databaseType.toUpperCase()}
                        </span>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Target Database
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {config.targetDatabaseName}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Schedule
                        </label>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getScheduleColor(
                            config.schedule
                          )}`}
                        >
                          {config.schedule.charAt(0).toUpperCase() +
                            config.schedule.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Database Connection URL
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm font-mono text-gray-800 break-all">
                          {config.databaseUrl}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                        <Calendar className="w-5 h-5" />
                        <span>Recent Activity</span>
                      </h2>
                      {logs.length > 0 && (
                        <Link
                          to="/logs"
                          className="text-white hover:text-gray-200 text-sm font-medium transition-colors duration-200"
                        >
                          View All
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    {logsLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">
                          Loading recent activity...
                        </p>
                      </div>
                    ) : logs.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                          No recent backup activity
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Run a backup to see activity here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {logs.map((log) => (
                          <div
                            key={log._id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-150"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(log.status)}
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                    log.status
                                  )}`}
                                >
                                  {log.status.charAt(0).toUpperCase() +
                                    log.status.slice(1)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {log.fileName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(log.createdAt).toLocaleDateString()}{" "}
                                  at{" "}
                                  {new Date(log.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">
                                {log.size > 0
                                  ? `${(log.size / 1024).toFixed(2)} KB`
                                  : "N/A"}
                              </span>
                              {log.url && (
                                <a
                                  href={log.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-all duration-200 space-x-1"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Download</span>
                                </a>
                              )}
                            </div>
                          </div>
                        ))}

                        {logs.length === 5 && (
                          <div className="text-center pt-4">
                            <Link
                              to="/logs"
                              className="inline-flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-all duration-200 space-x-2"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View All Backup Logs</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              {/* <div className="space-y-6">
                Status Card
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                    <h2 className="text-lg font-semibold text-white">Status</h2>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <span className="text-lg font-semibold text-green-800">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Configuration is ready for backups
                    </p>
                  </div>
                </div>

                Quick Actions
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                    <h2 className="text-lg font-semibold text-white">
                      Quick Actions
                    </h2>
                  </div>

                  <div className="p-6 space-y-3">
                    <Link
                      to="/logs"
                      className="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-all duration-200 space-x-2"
                    >
                      <Globe className="w-4 h-4" />
                      <span>View All Logs</span>
                    </Link>

                    <button className="w-full inline-flex items-center justify-center px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-all duration-200 space-x-2">
                      <Server className="w-4 h-4" />
                      <span>Test Connection</span>
                    </button>
                  </div>
                </div>

                Information
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">
                    Information
                  </h3>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Created: {config.createdAt || "Recently"}</li>
                    <li>• Last backup: {config.lastBackup || "Never"}</li>
                    <li>• Configuration ID: {config.id}</li>
                  </ul>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white">
                  Confirm Deletion
                </h2>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete the backup configuration "
                  {config.name}"? This action cannot be undone.
                </p>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfig}
                    disabled={actionLoading === "delete"}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {actionLoading === "delete" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BackupDetailPage;
