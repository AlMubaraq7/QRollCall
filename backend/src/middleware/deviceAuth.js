import { env } from "../config/env.js";
import { sendError } from "../utils/response.js";

export function deviceAuth(req, res, next) {
  const deviceKey = req.headers["x-device-key"];

  if (!deviceKey) {
    return sendError(res, "Device key required", 401);
  }

  if (deviceKey !== env.device.apiKey) {
    return sendError(res, "Invalid device key", 401);
  }

  next();
}
