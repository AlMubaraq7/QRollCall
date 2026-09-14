import { useState, useEffect } from "react";
import { getMyHistory } from "../../api/attendance";
import StudentNav from "../../components/layout/StudentNav";

const STATUS_STYLES = {
  present: "bg-success-bg text-success",
  late: "bg-warning-bg text-warning",
};

const STATUS_LABELS = {
  present: "Present",
  late: "Late",
};

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyHistory()
      .then(setHistory)
      .catch(() => setError("Failed to load attendance history"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <StudentNav />

      <div className="max-w-2xl mx-auto p-4 sm:p-8">
        <h1 className="font-display text-3xl text-ink mb-6">
          Attendance history
        </h1>

        {loading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-danger font-medium">{error}</p>}

        {!loading && history.length === 0 && (
          <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-600">No attendance records yet.</p>
          </div>
        )}

        <div className="space-y-3">
          {history.map((record) => (
            <div
              key={record.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-ink">
                  {record.course_code} — {record.course_name}
                </p>
                <p className="text-sm text-gray-600">{record.session_title}</p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-1 ${
                    STATUS_STYLES[record.status] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {STATUS_LABELS[record.status] || record.status}
                </span>
                <p className="text-xs text-gray-500">
                  {new Date(record.scanned_at).toLocaleDateString()}{" "}
                  {new Date(record.scanned_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
