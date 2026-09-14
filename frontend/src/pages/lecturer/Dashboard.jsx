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
    <div className="min-h-screen bg-paper">
      <LecturerNav />

      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <h1 className="font-display text-3xl text-ink mb-6">Your courses</h1>

        {loading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-danger font-medium">{error}</p>}

        {!loading && courses.length === 0 && (
          <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-600">
              No courses assigned to you yet. Contact your admin to be assigned
              to a course.
            </p>
          </div>
        )}

        <div className="grid gap-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/lecturer/courses/${course.id}`}
              className="bg-white border border-gray-200 border-l-4 border-l-gold rounded-md p-5 hover:border-gray-300 hover:border-l-gold transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-semibold text-ink">
                    {course.course_code} — {course.course_name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {course.student_count} student
                    {course.student_count !== "1" ? "s" : ""} enrolled
                  </p>
                </div>
                <span className="text-sm text-gray-400">View course</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
