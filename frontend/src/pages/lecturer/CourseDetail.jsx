import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById } from "../../api/courses";
import { createSession } from "../../api/sessions";
import LecturerNav from "../../components/layout/LecturerNav";

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [title, setTitle] = useState("");
  const [tokenInterval, setTokenInterval] = useState(30);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCourseById(courseId).then(setCourse);
  }, [courseId]);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setError("");
    setCreating(true);

    try {
      const session = await createSession({
        courseId,
        title,
        tokenInterval: Number(tokenInterval),
      });
      navigate(`/lecturer/sessions/${session.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create session");
    } finally {
      setCreating(false);
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50">
        <LecturerNav />
        <p className="p-8 text-gray-600">Loading course...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <LecturerNav />

      <div className="max-w-2xl mx-auto p-4 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {course.course_code} — {course.course_name}
        </h1>
        <p className="text-gray-600 mb-6">
          {course.students?.length || 0} students enrolled
        </p>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Start a new attendance session
          </h2>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded mb-4 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateSession}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Week 3 Lecture"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">
              QR refresh interval (seconds)
            </label>
            <input
              type="number"
              value={tokenInterval}
              onChange={(e) => setTokenInterval(e.target.value)}
              min={10}
              max={120}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-6 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />

            <button
              type="submit"
              disabled={creating}
              className="w-full bg-indigo-600 text-white font-medium py-2 rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {creating ? "Starting session..." : "Start Session"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
