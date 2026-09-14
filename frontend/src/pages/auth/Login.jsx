import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DemoCredentialsModal from "../../components/DemoCredentialsModal";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await loginUser(identifier, password);
      navigate(
        user.role === "lecturer" ? "/lecturer/dashboard" : "/student/scan",
      );
    } catch (err) {
      if (err.code === "ERR_NETWORK") {
        setError("Cannot reach the server. Check your connection.");
      } else {
        setError(err.response?.data?.error || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoAccount = (demoIdentifier, demoPassword) => {
    setIdentifier(demoIdentifier);
    setPassword(demoPassword);
    setShowDemoModal(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <span className="w-2 h-2 rounded-full bg-gold"></span>
          <span className="font-display text-xl text-ink">
            Smart Attendance
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-lg p-8"
        >
          <h1 className="font-display text-2xl text-ink mb-6">Sign in</h1>

          {error && (
            <div className="bg-danger-bg text-danger text-sm p-3 rounded mb-4 font-medium">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email or matric number
          </label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="you@oauife.edu.ng or CSC/2019/031"
            required
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 pr-10 text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-ink"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-white font-medium py-2.5 rounded hover:bg-ink-light disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setShowDemoModal(true)}
          className="w-full text-center text-sm text-gray-500 hover:text-ink mt-4 transition-colors"
        >
          View demo credentials
        </button>
      </div>

      {showDemoModal && (
        <DemoCredentialsModal
          onClose={() => setShowDemoModal(false)}
          onSelect={handleSelectDemoAccount}
        />
      )}
    </div>
  );
}
