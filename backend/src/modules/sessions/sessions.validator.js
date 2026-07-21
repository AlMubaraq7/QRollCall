import { z } from "zod";

export const createSessionSchema = z.object({
  courseId: z.uuid("Invalid course ID"),
  title: z.string().optional(),
  tokenInterval: z.number().int().min(10).max(120).optional(), // seconds
});
