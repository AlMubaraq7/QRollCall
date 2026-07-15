import * as authService from "./auth.service.js";
import { registerSchema, loginSchema } from "./auth.validator.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, parsed.error.errors[0].message, 400);
  }

  try {
    const { user, token } = await authService.registerUser(parsed.data);
    return sendSuccess(res, { user, token }, 201);
  } catch (err) {
    if (err.message === "EMAIL_TAKEN") {
      return sendError(res, "Email is already registered", 409);
    }
    if (err.message === "MATRIC_TAKEN") {
      return sendError(res, "Matric number is already registered", 409);
    }
    if (err.message === "MATRIC_REQUIRED") {
      return sendError(res, "Matric number is required for students", 400);
    }
    console.error("Register error:", err);
    return sendError(res, "Internal server error", 500);
  }
}

export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, parsed.error.errors[0].message, 400);
  }

  try {
    const { user, token } = await authService.loginUser(parsed.data);
    return sendSuccess(res, { user, token });
  } catch (err) {
    if (err.message === "INVALID_CREDENTIALS") {
      return sendError(res, "Invalid email or password", 401);
    }
    console.error("Login error:", err);
    return sendError(res, "Internal server error", 500);
  }
}

export async function getMe(req, res) {
  try {
    const user = await authService.getUserById(req.user.userId);
    return sendSuccess(res, { user });
  } catch (err) {
    if (err.message === "USER_NOT_FOUND") {
      return sendError(res, "User not found", 404);
    }
    return sendError(res, "Internal server error", 500);
  }
}
