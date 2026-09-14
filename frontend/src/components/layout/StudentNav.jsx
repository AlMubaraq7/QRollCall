import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function StudentNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-ink px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center">
      <Link to="/student/scan" className="flex items-center gap-2">
        <span className="font-display text-lg text-white">
          Class Attendance
        </span>
      </Link>
      <div className="flex items-center justify-between sm:justify-end gap-5">
        <Link
          to="/student/history"
          className="text-sm text-white/80 hover:text-white transition-colors"
        >
          History
        </Link>
        <Link
          to="/student/scan"
          className="text-sm text-white/80 hover:text-white transition-colors"
        >
          Scan
        </Link>
        <span className="text-sm text-white/70 truncate max-w-25">
          {user?.matric_number}
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-white/80 hover:text-white transition-colors shrink-0"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}
