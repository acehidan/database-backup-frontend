import React, { useState, useEffect } from "react";
import {
  Database,
  Plus,
  Play,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import Header from "./Header";

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

const HomePage: React.FC = () => {
  const [configs, setConfigs] = useState<BackupConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API}api/v1/backup-config/all`
      );

      if (response.status === 200) {
        setConfigs(response.data.backupConfigs);
      }
    } catch (error) {
      console.error("Error fetching backup configs:", error);
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
          setError(`Failed to load backup configurations: ${error.message}`);
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleRunBackup = async (configId: string) => {
    console.log(configId);
    setActionLoading(configId);
    const res = await axios.post(
      `${import.meta.env.VITE_APP_API}api/v1/manual-trigger`,
      {
        backupConfigId: configId,
      }
    );
    if (res.status === 200) {
      fetchConfigs();
      setActionLoading(null);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                Loading backup configurations...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-8 max-w-6xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Database Backup System
            </h1>
            <p className="text-gray-600 mb-6">
              Manage and monitor your database backup configurations
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  to="/create"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create New Backup</span>
                </Link>

                <button
                  onClick={fetchConfigs}
                  className="inline-flex items-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border border-gray-300 transition-all duration-200 transform hover:scale-105 space-x-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Refresh</span>
                </button>
              </div>
              <Link
                to="/backup-log"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 space-x-2"
              >
                <FileText className="w-5 h-5" />
                <span>View Backup Logs</span>
              </Link>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center space-x-3 max-w-4xl mx-auto">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Configurations List */}
          <div className="max-w-6xl mx-auto">
            {configs.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
                <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Backup Configurations Found
                </h3>
                <p className="text-gray-600 mb-6">
                  Get started by creating your first database backup
                  configuration
                </p>
                <Link
                  to="/create"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Backup</span>
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                  <h2 className="text-xl font-semibold text-white">
                    Backup Configurations ({configs.length})
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Database
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Target DB
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Schedule
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {configs.map((config, index) => (
                        <tr
                          key={config.id || index}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Database className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {config.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Created {config.createdAt || "Recently"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getDatabaseTypeColor(
                                config.databaseType
                              )}`}
                            >
                              {config.databaseType.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">
                              {config.targetDatabaseName}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getScheduleColor(
                                config.schedule
                              )}`}
                            >
                              {config.schedule.charAt(0).toUpperCase() +
                                config.schedule.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border bg-green-100 text-green-800 border-green-200">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleRunBackup(config._id)}
                                disabled={
                                  actionLoading ===
                                  (config._id || index.toString())
                                }
                                className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed space-x-1"
                              >
                                {actionLoading ===
                                (config._id || index.toString()) ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                                <span>Run</span>
                              </button>

                              {/* <button className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 space-x-1">
                              <Settings className="w-4 h-4" />
                              <span>Edit</span>
                            </button> */}

                              {/* <button
                              onClick={() =>
                                handleDeleteConfig(
                                  config.id || index.toString()
                                )
                              }
                              disabled={
                                actionLoading ===
                                (config.id || index.toString())
                              }
                              className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed space-x-1"
                            >
                              {actionLoading ===
                              (config.id || index.toString()) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                              <span>Delete</span>
                            </button> */}
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

          {/* Info Card */}
          {configs.length > 0 && (
            <div className="mt-8 max-w-4xl mx-auto bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Quick Actions
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    <strong>Run:</strong> Execute an immediate backup for the
                    selected configuration
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    <strong>Edit:</strong> Modify the backup configuration
                    settings
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    <strong>Delete:</strong> Permanently remove the backup
                    configuration
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HomePage;
