import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import CreateBackupForm from "./components/CreateBackupForm";
import BackupLogsPage from "./components/BackupLog";
import BackupDetailPage from "./components/BackupDetailPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateBackupForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/backup-log"
            element={
              <ProtectedRoute>
                <BackupLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/backup/:id"
            element={
              <ProtectedRoute>
                <BackupDetailPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
