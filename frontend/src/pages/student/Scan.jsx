import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { markAttendance } from "../../api/attendance";
import StudentNav from "../../components/layout/StudentNav";

function parseQrPayload(rawValue) {
  // Format A: full URL (?session=...&t=...) — used for manual/testing QR codes
  try {
    const url = new URL(rawValue);
    const sessionId = url.searchParams.get("session");
    const token = url.searchParams.get("t");
    if (sessionId && token) return { sessionId, token };
  } catch {
    // Not a URL — fall through to Format B
  }

  // Format B: compact "sessionId|token" — used by the ESP32 display
  const parts = rawValue.split("|");
  if (parts.length === 2 && parts[0] && parts[1]) {
    return { sessionId: parts[0], token: parts[1] };
  }

  return null;
}

// Resolves to { latitude, longitude } or null if permission is denied/unavailable.
// Attendance still submits without it — the backend decides whether it's required.
function getLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      () => resolve(null),
      { timeout: 5000, enableHighAccuracy: true },
    );
  });
}

export default function Scan() {
  const [mode, setMode] = useState("camera"); // 'camera' | 'manual'
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message }
  const [submitting, setSubmitting] = useState(false);
  const [manualSessionId, setManualSessionId] = useState("");
  const [manualToken, setManualToken] = useState("");
  const [cameraPaused, setCameraPaused] = useState(false);

  const submitAttendance = async (sessionId, token) => {
    setSubmitting(true);
    setStatus(null);
    try {
      const location = await getLocation();
      await markAttendance({
        sessionId,
        token,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });
      setStatus({
        type: "success",
        message: "Attendance marked successfully!",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.error || "Failed to mark attendance",
      });
    } finally {
      setSubmitting(false);
      // Re-enable scanning after a short pause so the same QR isn't
      // resubmitted instantly if it's still in view of the camera
      setTimeout(() => setCameraPaused(false), 2000);
    }
  };

  const handleScan = (detectedCodes) => {
    if (cameraPaused || submitting || !detectedCodes?.length) return;

    const raw = detectedCodes[0].rawValue;
    const parsed = parseQrPayload(raw);

    if (!parsed) {
      setStatus({
        type: "error",
        message: "That QR code is not a valid attendance code.",
      });
      return;
    }

    setCameraPaused(true);
    submitAttendance(parsed.sessionId, parsed.token);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualSessionId || !manualToken) return;
    submitAttendance(manualSessionId, manualToken);
  };

  return (
    <div className="min-h-screen bg-paper">
      <StudentNav />

      <div className="max-w-md mx-auto p-4 sm:p-8">
        <h1 className="font-display text-3xl text-ink mb-1">Scan attendance</h1>
        <p className="text-gray-600 text-sm mb-6">
          Point your camera at the QR code on the classroom display.
        </p>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode("camera")}
            className={`flex-1 text-sm font-medium py-2 rounded transition-colors ${
              mode === "camera"
                ? "bg-ink text-white"
                : "bg-white border border-gray-300 text-gray-700"
            }`}
          >
            Camera
          </button>
          <button
            onClick={() => setMode("manual")}
            className={`flex-1 text-sm font-medium py-2 rounded transition-colors ${
              mode === "manual"
                ? "bg-ink text-white"
                : "bg-white border border-gray-300 text-gray-700"
            }`}
          >
            Enter manually
          </button>
        </div>

        {status && (
          <div
            className={`rounded-md p-3 mb-4 text-sm font-medium ${
              status.type === "success"
                ? "bg-success-bg text-success border border-success/20"
                : "bg-danger-bg text-danger border border-danger/20"
            }`}
          >
            {status.message}
          </div>
        )}

        {mode === "camera" ? (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <Scanner
              onScan={handleScan}
              onError={(err) =>
                setStatus({
                  type: "error",
                  message: "Camera error: " + err.message,
                })
              }
              paused={cameraPaused || submitting}
              constraints={{ facingMode: "environment" }}
            />
            {submitting && (
              <div className="p-3 text-center text-sm text-gray-600 font-medium">
                Verifying...
              </div>
            )}
          </div>
        ) : (
          <form
            onSubmit={handleManualSubmit}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session ID
            </label>
            <input
              type="text"
              value={manualSessionId}
              onChange={(e) => setManualSessionId(e.target.value)}
              placeholder="Paste session UUID"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Token
            </label>
            <input
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="6-digit code"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-6 text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-ink text-white font-medium py-2.5 rounded hover:bg-ink-light disabled:opacity-50 transition-colors"
            >
              {submitting ? "Submitting..." : "Submit attendance"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
