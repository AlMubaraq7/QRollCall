import { z } from "zod";

export const markAttendanceSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
  token: z.string().min(1, "Token is required"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});
