import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import CreateBackupForm from "./components/CreateBackupForm";
import BackupLog from "./components/BackupLog";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateBackupForm />} />
        <Route path="/backup-log" element={<BackupLog />} />
      </Routes>
    </Router>
  );
}

export default App;
