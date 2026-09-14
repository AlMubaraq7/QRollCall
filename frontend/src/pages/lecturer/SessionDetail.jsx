import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { getSessionById, closeSession } from "../../api/sessions";
import { getSessionAttendance } from "../../api/attendance";
import LecturerNav from "../../components/layout/LecturerNav";

const POLL_INTERVAL_SECONDS = 5;
const STATUS_CONFIG = {
  active: {
    label: "Active",
    bg: "bg-success-bg",
    text: "text-success",
    dot: "bg-success",
  },
  closed: {
    label: "Closed",
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-danger-bg",
    text: "text-danger",
    dot: "bg-danger",
  },
};

export default function SessionDetail() {
  const { sessionId } = useParams();

  const [session, setSession] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [closing, setClosing] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(POLL_INTERVAL_SECONDS);

  const refreshAttendance = useCallback(() => {
    getSessionAttendance(sessionId)
      .then(setAttendance)
      .catch(() => {});
  }, [sessionId]);

  // Load the session once
  useEffect(() => {
    getSessionById(sessionId).then(setSession);
  }, [sessionId]);

  // Fetch once when the session loads or becomes active
  useEffect(() => {
    if (!session || session.status !== "active") return;
    refreshAttendance();
  }, [session, refreshAttendance]);

  // Single interval drives both the countdown tick and the periodic refetch
  useEffect(() => {
    if (!session || session.status !== "active") return;

    const tick = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          refreshAttendance();
          return POLL_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [session, refreshAttendance]);

  const handleClose = async () => {
    setClosing(true);
    try {
      const updated = await closeSession(sessionId);
      setSession((prev) => ({ ...prev, ...updated }));
    } finally {
      setClosing(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50">
        <LecturerNav />
        <p className="p-8 text-gray-600">Loading session...</p>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[session.status] || STATUS_CONFIG.closed;

  return (
    <div className="min-h-screen bg-paper">
      <LecturerNav />

      <div className="max-w-3xl mx-auto p-4 sm:p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="font-display text-3xl text-ink">
              {session.title || "Attendance Session"}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${statusConfig.bg} ${statusConfig.text}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
              ></span>
              {statusConfig.label}
            </span>
          </div>

          {session.status === "active" && (
            <button
              onClick={handleClose}
              disabled={closing}
              className="bg-danger text-white font-medium px-4 py-2 rounded hover:opacity-90 disabled:opacity-50 text-sm transition-opacity"
            >
              {closing ? "Closing..." : "Close session"}
            </button>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-ink">
              Live attendance ({attendance.length})
            </h2>
            <div className="flex items-center gap-4">
              <Link
                to={`/lecturer/sessions/${sessionId}/audit`}
                className="text-xs text-gray-500 hover:text-ink font-medium transition-colors"
              >
                View audit log
              </Link>
              {session.status === "active" && (
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold/75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
                  </span>
                  <span className="text-xs text-gray-500 font-medium tabular-nums">
                    Next refresh in {secondsLeft}s
                  </span>
                </div>
              )}
            </div>
          </div>

          {attendance.length === 0 ? (
            <p className="text-gray-600 text-sm">
              No students have scanned yet.
            </p>
          ) : (
            <>
              <table className="w-full text-sm hidden sm:table">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-200">
                    <th className="pb-2 text-left font-semibold">
                      Matric number
                    </th>
                    <th className="pb-2 text-left font-semibold">Name</th>
                    <th className="pb-2 text-right font-semibold">
                      Scanned at
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record.id} className="border-b border-gray-100">
                      <td className="py-2.5 text-left text-ink">
                        {record.matric_number}
                      </td>
                      <td className="py-2.5 text-left text-ink">
                        {record.full_name}
                      </td>
                      <td className="py-2.5 text-right text-gray-500 tabular-nums">
                        {new Date(record.scanned_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="sm:hidden space-y-3">
                {attendance.map((record) => (
                  <div
                    key={record.id}
                    className="border border-gray-100 rounded-md p-3 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-ink font-medium">{record.full_name}</p>
                      <p className="text-gray-500 text-xs">
                        {record.matric_number}
                      </p>
                    </div>
                    <span className="text-gray-500 text-xs tabular-nums">
                      {new Date(record.scanned_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
