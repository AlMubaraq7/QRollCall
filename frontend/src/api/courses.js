import api from "./client";

export const getMyCourses = () =>
  api.get("/courses").then((res) => res.data.data.courses);

export const getCourseById = (id) =>
  api.get(`/courses/${id}`).then((res) => res.data.data.course);

export const enrollStudent = (courseId, matricNumber) =>
  api
    .post(`/courses/${courseId}/enroll`, { matricNumber })
    .then((res) => res.data.data);

export const removeStudent = (courseId, studentId) =>
  api
    .delete(`/courses/${courseId}/students/${studentId}`)
    .then((res) => res.data.data);
