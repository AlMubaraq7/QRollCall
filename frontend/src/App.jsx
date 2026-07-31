import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/auth/Login";
import LecturerDashboard from "./pages/lecturer/Dashboard";
import CourseDetail from "./pages/lecturer/CourseDetail";
import SessionDetail from "./pages/lecturer/SessionDetail";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

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

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
