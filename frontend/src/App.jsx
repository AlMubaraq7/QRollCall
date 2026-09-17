import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/auth/Login";
import LecturerDashboard from "./pages/lecturer/Dashboard";
import CourseDetail from "./pages/lecturer/CourseDetail";
import SessionDetail from "./pages/lecturer/SessionDetail";
import AuditLog from "./pages/lecturer/AuditLog";
import Scan from "./pages/student/Scan";
import History from "./pages/student/History";
import CourseHistory from "./pages/lecturer/CourseHistory";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* Lecturer routes */}
          <Route
            path="/lecturer/dashboard"
            element={
              <ProtectedRoute role="lecturer">
                <LecturerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/courses/:courseId"
            element={
              <ProtectedRoute role="lecturer">
                <CourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/sessions/:sessionId"
            element={
              <ProtectedRoute role="lecturer">
                <SessionDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/sessions/:sessionId/audit"
            element={
              <ProtectedRoute role="lecturer">
                <AuditLog />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lecturer/courses/:courseId/history"
            element={
              <ProtectedRoute role="lecturer">
                <CourseHistory />
              </ProtectedRoute>
            }
          />
          {/* Student routes */}
          <Route
            path="/student/scan"
            element={
              <ProtectedRoute role="student">
                <Scan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/history"
            element={
              <ProtectedRoute role="student">
                <History />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
