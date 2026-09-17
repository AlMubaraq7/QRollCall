// import { useState, useEffect, useMemo } from "react";
// import { getMyHistory, getCourseSummary } from "../../api/attendance";
// import { getMyCourses } from "../../api/courses";
// import StudentNav from "../../components/layout/StudentNav";

// const STATUS_STYLES = {
//   present: "bg-success-bg text-success",
//   late: "bg-warning-bg text-warning",
// };

// const STATUS_LABELS = {
//   present: "Present",
//   late: "Late",
// };

// export default function History() {
//   const [history, setHistory] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [selectedCourseId, setSelectedCourseId] = useState("all");
//   const [summary, setSummary] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     Promise.all([getMyHistory(), getMyCourses()])
//       .then(([historyData, coursesData]) => {
//         setHistory(historyData);
//         setCourses(coursesData);
//       })
//       .catch(() => setError("Failed to load attendance history"))
//       .finally(() => setLoading(false));
//   }, []);

//   useEffect(() => {
//     if (selectedCourseId === "all") {
//       // eslint-disable-next-line react-hooks/set-state-in-effect
//       setSummary(null);
//       return;
//     }
//     getCourseSummary(selectedCourseId)
//       .then(setSummary)
//       .catch(() => setSummary(null));
//   }, [selectedCourseId]);

//   const filteredHistory = useMemo(() => {
//     if (selectedCourseId === "all") return history;
//     const course = courses.find((c) => c.id === selectedCourseId);
//     if (!course) return history;
//     return history.filter(
//       (record) => record.course_code === course.course_code,
//     );
//   }, [history, courses, selectedCourseId]);

//   return (
//     <div className="min-h-screen bg-paper">
//       <StudentNav />

//       <div className="max-w-2xl mx-auto p-4 sm:p-8">
//         <h1 className="font-display text-3xl text-ink mb-4">
//           Attendance history
//         </h1>

//         {courses.length > 0 && (
//           <div className="mb-4">
//             <select
//               value={selectedCourseId}
//               onChange={(e) => setSelectedCourseId(e.target.value)}
//               className="border border-gray-300 rounded px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
//             >
//               <option value="all">All courses</option>
//               {courses.map((course) => (
//                 <option key={course.id} value={course.id}>
//                   {course.course_code} — {course.course_name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         )}

//         {summary && (
//           <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">
//                 Attendance for this course
//               </p>
//               <p className="text-ink font-semibold">
//                 {summary.attended} of {summary.totalSessions} sessions attended
//               </p>
//             </div>
//             <div className="text-right">
//               <p className="font-display text-3xl text-ink">
//                 {summary.percentage}%
//               </p>
//             </div>
//           </div>
//         )}

//         {loading && <p className="text-gray-600">Loading...</p>}
//         {error && <p className="text-danger font-medium">{error}</p>}

//         {!loading && filteredHistory.length === 0 && (
//           <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
//             <p className="text-gray-600">No attendance records yet.</p>
//           </div>
//         )}

//         <div className="space-y-3">
//           {filteredHistory.map((record) => (
//             <div
//               key={record.id}
//               className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center"
//             >
//               <div>
//                 <p className="font-semibold text-ink">
//                   {record.course_code} — {record.course_name}
//                 </p>
//                 <p className="text-sm text-gray-600">{record.session_title}</p>
//               </div>
//               <div className="text-right">
//                 <span
//                   className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-1 ${
//                     STATUS_STYLES[record.status] || "bg-gray-100 text-gray-600"
//                   }`}
//                 >
//                   {STATUS_LABELS[record.status] || record.status}
//                 </span>
//                 <p className="text-xs text-gray-500">
//                   {new Date(record.scanned_at).toLocaleDateString()}{" "}
//                   {new Date(record.scanned_at).toLocaleTimeString()}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect, useMemo } from "react";
import { getMyHistory, getCourseSummary } from "../../api/attendance";
import { getMyCourses } from "../../api/courses";
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
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getMyHistory(), getMyCourses()])
      .then(([historyData, coursesData]) => {
        setHistory(historyData);
        setCourses(coursesData);
      })
      .catch(() => setError("Failed to load attendance history"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedCourseId === "all") return; // nothing to fetch — no state to reset either

    getCourseSummary(selectedCourseId)
      .then((data) => setSummary({ courseId: selectedCourseId, ...data }))
      .catch(() => setSummary({ courseId: selectedCourseId, error: true }));
  }, [selectedCourseId]);

  // Only show a summary that actually belongs to the currently selected course —
  // this naturally hides stale data on switch, with no explicit reset needed
  const visibleSummary =
    selectedCourseId !== "all" &&
    summary?.courseId === selectedCourseId &&
    !summary.error
      ? summary
      : null;

  const filteredHistory = useMemo(() => {
    if (selectedCourseId === "all") return history;
    const course = courses.find((c) => c.id === selectedCourseId);
    if (!course) return history;
    return history.filter(
      (record) => record.course_code === course.course_code,
    );
  }, [history, courses, selectedCourseId]);

  return (
    <div className="min-h-screen bg-paper">
      <StudentNav />

      <div className="max-w-2xl mx-auto p-4 sm:p-8">
        <h1 className="font-display text-3xl text-ink mb-4">
          Attendance history
        </h1>

        {courses.length > 0 && (
          <div className="mb-4">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
            >
              <option value="all">All courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.course_code} — {course.course_name}
                </option>
              ))}
            </select>
          </div>
        )}
        {visibleSummary && (
          <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Attendance for this course
              </p>
              <p className="text-ink font-semibold">
                {visibleSummary.attended} of {visibleSummary.totalSessions}{" "}
                sessions attended
              </p>
            </div>

            <div className="text-right">
              <p className="font-display text-3xl text-ink">
                {visibleSummary.percentage}%
              </p>
            </div>
          </div>
        )}

        {loading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-danger font-medium">{error}</p>}

        {!loading && filteredHistory.length === 0 && (
          <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-600">No attendance records yet.</p>
          </div>
        )}

        <div className="space-y-3">
          {filteredHistory.map((record) => (
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
