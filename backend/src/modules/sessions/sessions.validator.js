import { z } from "zod";

export const createSessionSchema = z.object({
  courseId: z.uuid("Invalid course ID"),
  title: z.string().optional(),
  tokenInterval: z.number().int().min(10).max(120).optional(), // seconds
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radiusMeters: z.number().int().min(10).max(2000).optional(),
});
