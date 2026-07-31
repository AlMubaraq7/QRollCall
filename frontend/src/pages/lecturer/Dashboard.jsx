import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyCourses } from "../../api/courses";
import LecturerNav from "../../components/layout/LecturerNav";

export default function LecturerDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyCourses()
      .then(setCourses)
      .catch(() => setError("Failed to load courses"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <LecturerNav />

      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Courses</h1>

        {loading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-red-600 font-medium">{error}</p>}

        {!loading && courses.length === 0 && (
          <p className="text-gray-600">
            No courses assigned to you yet. Contact your admin to be assigned to
            a course.
          </p>
        )}

        <div className="grid gap-4">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/lecturer/courses/${course.id}`}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-indigo-300 transition-all"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {course.course_code} — {course.course_name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {course.student_count} student
                    {course.student_count !== "1" ? "s" : ""} enrolled
                  </p>
                </div>
                <span className="text-indigo-600 font-medium text-sm">
                  View →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
