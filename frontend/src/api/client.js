import axios from "axios";
// const api = axios.create({
//   baseURL: "http://localhost:5000/api/v1",
// });
// const API_PORT = 5000;
// const apiHost = window.location.hostname; // matches whatever host loaded the page

// const api = axios.create({
//   baseURL: `http://${apiHost}:${API_PORT}/api/v1`,
// });
const api = axios.create({
  baseURL: "/api/v1", // relative — resolves against whatever origin loaded the page
});

// Attach the JWT to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token expires (401), log the user out automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
