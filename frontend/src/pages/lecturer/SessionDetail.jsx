import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getSessionById, closeSession } from "../../api/sessions";
import { getSessionAttendance } from "../../api/attendance";
import LecturerNav from "../../components/layout/LecturerNav";

const POLL_INTERVAL_SECONDS = 5;

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

  return (
    <div className="min-h-screen bg-slate-50">
      <LecturerNav />

      <div className="max-w-3xl mx-auto p-4 sm:p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {session.title || "Attendance Session"}
            </h1>
            <span
              className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded ${
                session.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {session.status.toUpperCase()}
            </span>
          </div>

          {session.status === "active" && (
            <button
              onClick={handleClose}
              disabled={closing}
              className="bg-red-600 text-white font-medium px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 text-sm transition-colors"
            >
              {closing ? "Closing..." : "Close Session"}
            </button>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">
              Live Attendance ({attendance.length})
            </h2>
            {session.status === "active" && (
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-xs text-gray-600 font-medium tabular-nums">
                  Next refresh in {secondsLeft}s
                </span>
              </div>
            )}
          </div>

          {attendance.length === 0 ? (
            <p className="text-gray-600 text-sm">
              No students have scanned yet.
            </p>
          ) : (
            <>
              {/* Table — visible on sm and up */}
              <table className="w-full text-sm hidden sm:table">
                <thead>
                  <tr className="text-gray-600 border-b border-gray-200">
                    <th className="pb-2 text-left font-semibold">
                      Matric Number
                    </th>
                    <th className="pb-2 text-left font-semibold">Name</th>
                    <th className="pb-2 text-right font-semibold">
                      Scanned At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record.id} className="border-b border-gray-100">
                      <td className="py-2.5 text-left text-gray-900">
                        {record.matric_number}
                      </td>
                      <td className="py-2.5 text-left text-gray-900">
                        {record.full_name}
                      </td>
                      <td className="py-2.5 text-right text-gray-600 tabular-nums">
                        {new Date(record.scanned_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Stacked cards — visible below sm */}
              <div className="sm:hidden space-y-3">
                {attendance.map((record) => (
                  <div
                    key={record.id}
                    className="border border-gray-100 rounded-md p-3 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-gray-900 font-medium">
                        {record.full_name}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {record.matric_number}
                      </p>
                    </div>
                    <span className="text-gray-600 text-xs tabular-nums">
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
