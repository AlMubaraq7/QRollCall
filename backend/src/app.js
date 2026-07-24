import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import authRoutes from "./modules/auth/auth.routes.js";
import courseRoutes from "./modules/courses/courses.routes.js";
import sessionRoutes from "./modules/sessions/sessions.routes.js";
import deviceRoutes from "./modules/device/device.routes.js";
import attendanceRoutes from "./modules/attendance/attendance.routes.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:3000", // your frontend URL
    credentials: true,
  }),
);

// Body parser
app.use(express.json());

// Rate limiter for auth routes (max 20 requests per 15 minutes per IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: "Too many requests, please try again later",
  },
});

const markLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 attempts per minute per IP
  message: { success: false, error: "Too many attempts, please slow down" },
});

// Routes
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/sessions", sessionRoutes);
app.use("/api/v1/device", deviceRoutes);
app.use("/api/v1/attendance/mark", markLimiter);
app.use("/api/v1/attendance", attendanceRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: "Internal server error" });
});

app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});

export default app;
