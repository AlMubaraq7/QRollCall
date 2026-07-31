import api from "./client";

export const getSessionAttendance = (sessionId) =>
  api
    .get(`/attendance/session/${sessionId}`)
    .then((res) => res.data.data.attendance);
