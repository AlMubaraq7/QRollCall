import api from "./client";

export const getSessionAttendance = (sessionId) =>
  api
    .get(`/attendance/session/${sessionId}`)
    .then((res) => res.data.data.attendance);

export const markAttendance = ({ sessionId, token, latitude, longitude }) =>
  api
    .post("/attendance/mark", { sessionId, token, latitude, longitude })
    .then((res) => res.data.data.record);

export const getMyHistory = () =>
  api.get("/attendance/history").then((res) => res.data.data.history);
