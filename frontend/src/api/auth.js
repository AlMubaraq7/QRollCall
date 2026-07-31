import api from "./client";

export const login = (email, password) =>
  api.post("/auth/login", { email, password }).then((res) => res.data.data);

export const register = (payload) =>
  api.post("/auth/register", payload).then((res) => res.data.data);

export const getMe = () => api.get("/auth/me").then((res) => res.data.data);
