import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getCourseById, enrollStudent, removeStudent } from "../../api/courses";
import { createSession } from "../../api/sessions";
import LecturerNav from "../../components/layout/LecturerNav";

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [title, setTitle] = useState("");
  const [tokenInterval, setTokenInterval] = useState(30);
  const [location, setLocation] = useState(null);
  const [radiusMeters, setRadiusMeters] = useState(100);
  const [locating, setLocating] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [idCopied, setIdCopied] = useState(false);

  const [matricInput, setMatricInput] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  const [enrollSuccess, setEnrollSuccess] = useState("");
  const [removingId, setRemovingId] = useState(null);

  const loadCourse = () => {
    getCourseById(courseId).then(setCourse);
  };

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(courseId);
      setIdCopied(true);
      setTimeout(() => setIdCopied(false), 2000);
    } catch {
      setError("Could not copy — select and copy the ID manually");
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported on this device");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setError("Could not get your location — check browser permissions");
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  const handleUseManualLocation = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setError("Enter valid numeric latitude and longitude");
      return;
    }
    setError("");
    setLocation({ latitude: lat, longitude: lng });
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setError("");
    setCreating(true);

    try {
      const session = await createSession({
        courseId,
        title,
        tokenInterval: Number(tokenInterval),
        latitude: location?.latitude,
        longitude: location?.longitude,
        radiusMeters: location ? Number(radiusMeters) : undefined,
      });
      navigate(`/lecturer/sessions/${session.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create session");
    } finally {
      setCreating(false);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    setEnrollError("");
    setEnrollSuccess("");

    if (!matricInput.trim()) return;

    setEnrolling(true);
    try {
      await enrollStudent(courseId, matricInput.trim());
      setEnrollSuccess(`${matricInput.trim()} enrolled successfully`);
      setMatricInput("");
      loadCourse();
    } catch (err) {
      setEnrollError(err.response?.data?.error || "Failed to enroll student");
    } finally {
      setEnrolling(false);
    }
  };

  const handleRemove = async (studentId) => {
    setRemovingId(studentId);
    try {
      await removeStudent(courseId, studentId);
      loadCourse();
    } catch {
      setEnrollError("Failed to remove student");
    } finally {
      setRemovingId(null);
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-paper">
        <LecturerNav />
        <p className="p-8 text-gray-600">Loading course...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <LecturerNav />

      <div className="max-w-2xl mx-auto p-4 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
            <h1 className="font-display text-3xl text-ink">
              {course.course_code} — {course.course_name}
            </h1>
            <Link
              to={`/lecturer/courses/${courseId}/history`}
              className="text-sm text-gray-500 hover:text-ink font-medium transition-colors"
            >
              Session history →
            </Link>
          </div>
          <p className="text-gray-600 mb-2">
            {course.students?.length || 0} students enrolled
          </p>

          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded px-3 py-2 text-xs">
            <span className="text-gray-500">Course ID (for ESP32 config):</span>
            <code className="text-ink font-mono flex-1 truncate">
              {courseId}
            </code>
            <button
              onClick={handleCopyId}
              className="text-gold hover:text-gold-light font-medium shrink-0"
            >
              {idCopied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Start session */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold text-ink mb-4">
            Start a new attendance session
          </h2>

          {error && (
            <div className="bg-danger-bg text-danger text-sm p-3 rounded mb-4 font-medium">
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
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
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
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
            />

            <div className="mb-6 border-t border-gray-100 pt-4">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Restrict to classroom location (optional)
              </label>

              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={locating}
                  className="text-xs font-medium text-gold hover:text-gold-light disabled:opacity-50"
                >
                  {locating ? "Getting location..." : "Use my current location"}
                </button>
              </div>

              <details className="mb-3">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-ink">
                  Or enter coordinates manually (for testing)
                </summary>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    placeholder="Latitude"
                    className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm text-ink"
                  />
                  <input
                    type="text"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    placeholder="Longitude"
                    className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm text-ink"
                  />
                  <button
                    type="button"
                    onClick={handleUseManualLocation}
                    className="text-xs font-medium bg-gray-100 text-ink px-3 py-1.5 rounded hover:bg-gray-200 shrink-0"
                  >
                    Set
                  </button>
                </div>
              </details>

              {location ? (
                <div className="bg-success-bg border border-success/20 rounded p-3 text-sm">
                  <p className="text-success font-medium mb-2">
                    Location set ({location.latitude.toFixed(5)},{" "}
                    {location.longitude.toFixed(5)}) — students must be nearby
                    to mark attendance
                  </p>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Allowed radius (meters)
                  </label>
                  <input
                    type="number"
                    value={radiusMeters}
                    onChange={(e) => setRadiusMeters(e.target.value)}
                    min={10}
                    max={2000}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-ink text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setLocation(null)}
                    className="text-xs text-danger hover:underline mt-2"
                  >
                    Remove location restriction
                  </button>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  No location set — students can mark attendance from anywhere.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full bg-ink text-white font-medium py-2.5 rounded hover:bg-ink-light disabled:opacity-50 transition-colors"
            >
              {creating ? "Starting session..." : "Start session"}
            </button>
          </form>
        </div>

        {/* Manage students */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold text-ink mb-4">Manage students</h2>

          {enrollError && (
            <div className="bg-danger-bg text-danger text-sm p-3 rounded mb-4 font-medium">
              {enrollError}
            </div>
          )}
          {enrollSuccess && (
            <div className="bg-success-bg text-success text-sm p-3 rounded mb-4 font-medium">
              {enrollSuccess}
            </div>
          )}

          <form onSubmit={handleEnroll} className="flex gap-2 mb-6">
            <input
              type="text"
              value={matricInput}
              onChange={(e) => setMatricInput(e.target.value)}
              placeholder="e.g. CSC/2019/031"
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
            />
            <button
              type="submit"
              disabled={enrolling}
              className="bg-ink text-white font-medium px-4 py-2 rounded hover:bg-ink-light disabled:opacity-50 transition-colors text-sm shrink-0"
            >
              {enrolling ? "Enrolling..." : "Enroll"}
            </button>
          </form>

          {course.students?.length === 0 ? (
            <p className="text-gray-600 text-sm">No students enrolled yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {course.students.map((student) => (
                <div
                  key={student.id}
                  className="py-3 flex justify-between items-center"
                >
                  <div>
                    <p className="text-ink font-medium text-sm">
                      {student.full_name}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {student.matric_number}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(student.id)}
                    disabled={removingId === student.id}
                    className="text-xs text-danger hover:underline disabled:opacity-50"
                  >
                    {removingId === student.id ? "Removing..." : "Remove"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
