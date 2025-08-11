import React, { useState, useEffect } from "react";
import {
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

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

const BackupLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<BackupLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<BackupLog | null>(null);
  const [showLogDetail, setShowLogDetail] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API}api/v1/backup-file/all`
      );
      console.log(response);
      if (response.status === 200) {
        setLogs(response.data.backupFiles);
      }
    } catch (error) {
      console.error("Error fetching backup logs:", error);
      if (error instanceof Error) {
        if (error.name === "TimeoutError") {
          setError(
            "Request timed out. Please check your connection and try again."
          );
        } else if (error.message.includes("Failed to fetch")) {
          setError(
            "Unable to connect to the backup service. Please check if the service is running and try again."
          );
        } else {
          setError(`Failed to load backup logs: ${error.message}`);
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRefresh = () => {
    fetchLogs();
  };

  const handleViewLogDetail = (log: BackupLog) => {
    setSelectedLog(log);
    setShowLogDetail(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Loading backup logs...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8 max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors duration-200 space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>

            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Backup Logs</h1>
          <p className="text-gray-600 mb-6">
            Monitor the status and details of all database backup operations
          </p>

          {/* Action Button */}
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border border-gray-300 transition-all duration-200 transform hover:scale-105 space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center space-x-3 max-w-4xl mx-auto">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Backup Logs */}
        <div className="max-w-6xl mx-auto">
          {logs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Backup Logs Found
              </h3>
              <p className="text-gray-600 mb-6">
                Backup logs will appear here once you start running backups
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Go to Dashboard</span>
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-teal-600 px-8 py-6">
                <h2 className="text-xl font-semibold text-white">
                  All Backup Logs ({logs.length})
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        File Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Size
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Created
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {logs.map((log) => (
                      <tr
                        key={log._id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(log.status)}
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                                log.status
                              )}`}
                            >
                              {log.status.charAt(0).toUpperCase() +
                                log.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">
                            {log.name}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-900 font-mono text-sm">
                            {log.fileName}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-900">
                            {log.size > 0
                              ? `${(log.size / 1024).toFixed(2)} KB`
                              : "N/A"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-900">
                            {new Date(log.createdAt).toLocaleDateString()}{" "}
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleViewLogDetail(log)}
                              className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 space-x-1"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Details</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Log Detail Modal */}
        {showLogDetail && selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-green-600 to-teal-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Backup Log Details
                  </h2>
                  <button
                    onClick={() => setShowLogDetail(false)}
                    className="text-white hover:text-gray-200 transition-colors duration-200"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedLog.status)}
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                          selectedLog.status
                        )}`}
                      >
                        {selectedLog.status.charAt(0).toUpperCase() +
                          selectedLog.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <p className="text-gray-900 font-semibold">
                      {selectedLog.name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      File Name
                    </label>
                    <p className="text-gray-900 font-mono text-sm">
                      {selectedLog.fileName}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size
                    </label>
                    <p className="text-gray-900">
                      {selectedLog.size > 0
                        ? `${(selectedLog.size / 1024).toFixed(2)} KB`
                        : "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Created At
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedLog.createdAt).toLocaleDateString()}{" "}
                      {new Date(selectedLog.createdAt).toLocaleTimeString()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Updated At
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedLog.updatedAt).toLocaleDateString()}{" "}
                      {new Date(selectedLog.updatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {selectedLog.url && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Download URL
                    </label>
                    <a
                      href={selectedLog.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline break-all"
                    >
                      {selectedLog.url}
                    </a>
                  </div>
                )}

                {selectedLog.spaceKey && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Space Key
                    </label>
                    <p className="text-gray-900 font-mono text-sm break-all">
                      {selectedLog.spaceKey}
                    </p>
                  </div>
                )}

                {selectedLog.errorMessage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Error Message
                    </label>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 font-mono text-sm whitespace-pre-wrap">
                        {selectedLog.errorMessage}
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    onClick={() => setShowLogDetail(false)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackupLogsPage;
