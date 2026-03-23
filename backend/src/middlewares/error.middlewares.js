import HTTP_STATUS from "../constants/httpStatus.js";
import { ErrorWithStatus } from "../models/Errors.js";

/**
 * Default error handler – theo shoppingCartBE
 * Bắt mọi error và trả JSON { message }
 */
export function defaultErrorHandler(err, req, res, next) {
  if (err instanceof ErrorWithStatus) {
    return res.status(err.status || 500).json({ message: err.message });
  }
  const status = err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || "Internal server error";
  return res.status(status).json({ message });
}
