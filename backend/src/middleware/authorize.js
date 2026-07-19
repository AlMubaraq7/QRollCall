import { sendError } from "../utils/response.js";

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Not authenticated", 401);
    }
    if (!roles.includes(req.user.role)) {
      return sendError(res, "Access denied", 403);
    }
    next();
  };
}
