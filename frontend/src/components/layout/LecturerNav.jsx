import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LecturerNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center">
      <Link
        to="/lecturer/dashboard"
        className="text-lg font-bold text-indigo-700"
      >
        Smart Attendance
      </Link>
      <div className="flex items-center justify-between sm:justify-end gap-4">
        <span className="text-sm text-gray-700 font-medium truncate max-w-[160px] sm:max-w-none">
          {user?.full_name}
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 font-medium hover:text-red-700 hover:underline shrink-0"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}
