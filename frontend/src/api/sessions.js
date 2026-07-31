import api from "./client";

export const createSession = (payload) =>
  api.post("/sessions", payload).then((res) => res.data.data.session);

export const getSessionById = (id) =>
  api.get(`/sessions/${id}`).then((res) => res.data.data.session);

export const closeSession = (id) =>
  api.patch(`/sessions/${id}/close`).then((res) => res.data.data.session);

export const cancelSession = (id) =>
  api.patch(`/sessions/${id}/cancel`).then((res) => res.data.data.session);
