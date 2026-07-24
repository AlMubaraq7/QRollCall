import { z } from "zod";

export const markAttendanceSchema = z.object({
  sessionId: z.uuid("Invalid session ID"),
  token: z.string().min(1, "Token is required"),
});
