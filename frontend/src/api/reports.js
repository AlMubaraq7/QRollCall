import api from "./client";

export const getSessionAudit = (sessionId) =>
  api
    .get(`/reports/session/${sessionId}/audit`)
    .then((res) => res.data.data.auditLog);
