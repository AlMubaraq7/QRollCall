import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getSessionAudit } from "../../api/reports";
import LecturerNav from "../../components/layout/LecturerNav";

const OUTCOME_STYLES = {
  SUCCESS: "bg-green-100 text-green-800",
  DUPLICATE: "bg-amber-100 text-amber-800",
  NOT_ENROLLED: "bg-red-100 text-red-800",
  INVALID_TOKEN: "bg-red-100 text-red-800",
  SESSION_NOT_ACTIVE: "bg-gray-200 text-gray-700",
  LOCATION_REQUIRED: "bg-orange-100 text-orange-800",
  OUT_OF_RANGE: "bg-orange-100 text-orange-800",
};

const OUTCOME_LABELS = {
  SUCCESS: "Marked present",
  DUPLICATE: "Already marked",
  NOT_ENROLLED: "Not enrolled",
  INVALID_TOKEN: "Invalid / expired QR",
  SESSION_NOT_ACTIVE: "Session inactive",
  LOCATION_REQUIRED: "Location missing",
  OUT_OF_RANGE: "Outside classroom",
};

export default function AuditLog() {
  const { sessionId } = useParams();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSessionAudit(sessionId)
      .then(setEntries)
      .catch(() => setError("Failed to load audit log"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  // Simple client-side pattern flag: same IP appearing under 3+ different students
  const ipToStudents = {};
  entries.forEach((e) => {
    if (!e.ip_address) return;
    ipToStudents[e.ip_address] = ipToStudents[e.ip_address] || new Set();
    ipToStudents[e.ip_address].add(e.matric_number || "unknown");
  });
  const suspiciousIps = Object.entries(ipToStudents)
    .filter(([, students]) => students.size >= 3)
    .map(([ip]) => ip);

  return (
    <div className="min-h-screen bg-paper">
      <LecturerNav />

      <div className="max-w-3xl mx-auto p-4 sm:p-8">
        <Link
          to={`/lecturer/sessions/${sessionId}`}
          className="text-sm text-gray-500 hover:text-ink mb-4 inline-block transition-colors"
        >
          ← Back to session
        </Link>

        <h1 className="font-display text-3xl text-ink mb-1">
          Attendance audit log
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          Every scan attempt for this session, successful or not.
        </p>

        {suspiciousIps.length > 0 && (
          <div className="bg-warning-bg border border-warning/20 rounded-lg p-4 mb-6">
            <p className="text-warning font-semibold text-sm mb-1">
              Possible pattern worth reviewing
            </p>
            <p className="text-warning/90 text-sm">
              {suspiciousIps.length === 1
                ? `IP address ${suspiciousIps[0]} was used by 3 or more different students.`
                : `${suspiciousIps.length} IP addresses were each used by 3 or more different students.`}{" "}
              This can be innocent (shared campus Wi-Fi), but may be worth a
              closer look.
            </p>
          </div>
        )}

        {loading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-danger font-medium">{error}</p>}

        {!loading && entries.length === 0 && (
          <p className="text-gray-600">
            No scan attempts recorded for this session yet.
          </p>
        )}

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm hidden sm:table">
            <thead>
              <tr className="text-gray-500 border-b border-gray-200 bg-gray-50">
                <th className="p-3 text-left font-semibold">Student</th>
                <th className="p-3 text-left font-semibold">Outcome</th>
                <th className="p-3 text-left font-semibold">IP address</th>
                <th className="p-3 text-right font-semibold">Time</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-100">
                  <td className="p-3 text-ink">
                    {entry.full_name ? (
                      <>
                        {entry.full_name}{" "}
                        <span className="text-gray-500 text-xs">
                          ({entry.matric_number})
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400">Unknown</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        OUTCOME_STYLES[entry.outcome] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {OUTCOME_LABELS[entry.outcome] || entry.outcome}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">
                    {entry.ip_address || "—"}
                  </td>
                  <td className="p-3 text-right text-gray-500 tabular-nums">
                    {new Date(entry.logged_at).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="sm:hidden divide-y divide-gray-100">
            {entries.map((entry) => (
              <div key={entry.id} className="p-3">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-ink font-medium text-sm">
                    {entry.full_name || "Unknown"}
                  </p>
                  <span className="text-gray-500 text-xs tabular-nums">
                    {new Date(entry.logged_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      OUTCOME_STYLES[entry.outcome] ||
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {OUTCOME_LABELS[entry.outcome] || entry.outcome}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {entry.ip_address || "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
