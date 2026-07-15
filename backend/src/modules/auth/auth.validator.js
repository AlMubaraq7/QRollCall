import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    fullName: z.string().min(2, "Full name is required"),
    role: z.enum(["student", "lecturer"], {
      message: "Role must be student or lecturer",
    }),
    matricNumber: z.string().optional(),
    department: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role === "student" && !data.matricNumber) {
        return false;
      }
      return true;
    },
    {
      message: "Matric number is required for students",
      path: ["matricNumber"],
    },
  );

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
