import api from "./client";

export const getMyCourses = () =>
  api.get("/courses").then((res) => res.data.data.courses);

export const getCourseById = (id) =>
  api.get(`/courses/${id}`).then((res) => res.data.data.course);
