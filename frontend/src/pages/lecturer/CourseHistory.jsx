import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getCourseReport } from "../../api/reports";
import LecturerNav from "../../components/layout/LecturerNav";

const STATUS_CONFIG = {
  active: { label: "Active", bg: "bg-success-bg", text: "text-success" },
  closed: { label: "Closed", bg: "bg-gray-100", text: "text-gray-600" },
  cancelled: { label: "Cancelled", bg: "bg-danger-bg", text: "text-danger" },
};

export default function CourseHistory() {
  const { courseId } = useParams();

  const [sessions, setSessions] = useState([]);
  const [totalEnrolled, setTotalEnrolled] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCourseReport(courseId)
      .then((data) => {
        setSessions(data.sessions);
        setTotalEnrolled(data.totalEnrolled);
      })
      .catch(() => setError("Failed to load session history"))
      .finally(() => setLoading(false));
  }, [courseId]);

  return (
    <div className="min-h-screen bg-paper">
      <LecturerNav />

      <div className="max-w-3xl mx-auto p-4 sm:p-8">
        <Link
          to={`/lecturer/courses/${courseId}`}
          className="text-sm text-gray-500 hover:text-ink mb-4 inline-block transition-colors"
        >
          ← Back to course
        </Link>

        <h1 className="font-display text-3xl text-ink mb-1">Session history</h1>
        <p className="text-gray-600 text-sm mb-6">
          {totalEnrolled} students enrolled in this course
        </p>

        {loading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-danger font-medium">{error}</p>}

        {!loading && sessions.length === 0 && (
          <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-600">
              No sessions have been created for this course yet.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {sessions.map((session) => {
            const statusConfig =
              STATUS_CONFIG[session.status] || STATUS_CONFIG.closed;
            const attendeeCount = parseInt(session.attendee_count, 10);
            const percentage =
              totalEnrolled > 0
                ? Math.round((attendeeCount / totalEnrolled) * 100)
                : 0;

            return (
              <Link
                key={session.session_id}
                to={`/lecturer/sessions/${session.session_id}`}
                className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="font-semibold text-ink">
                      {session.title || "Untitled session"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(session.started_at).toLocaleDateString()}{" "}
                      {new Date(session.started_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${statusConfig.bg} ${statusConfig.text}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {attendeeCount} of {totalEnrolled} attended
                  </p>
                  <p className="text-sm font-semibold text-ink">
                    {percentage}%
                  </p>
                </div>
                <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
