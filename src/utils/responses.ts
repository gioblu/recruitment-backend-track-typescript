/**
 * src/utils/responses.ts
 *
 * Standardized API response formatters for consistent client interface.
 * All responses include timestamps and optional request IDs for tracking.
 */

import { Request, Response } from 'express';

/**
 * Standard API response envelope
 */
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  requestId?: string;
};

/**
 * Send a successful response with consistent format
 *
 * Wraps data in standardized envelope with timestamp and request ID.
 * Used for all successful operations (200, 201, etc.).
 *
 * @param res - Express Response object
 * @param data - The response payload
 * @param statusCode - HTTP status code (default: 200)
 * @param req - Optional Express Request for including request ID
 * @returns Express Response object for chaining
 */
export const sendSuccess = <T>(res: Response, data: T, statusCode = 200, req?: Request): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    ...(req?.id && { requestId: req.id }),
  });
};

/**
 * Send an error response with consistent format
 *
 * Wraps error message in standardized envelope with timestamp and request ID.
 * Optionally includes additional metadata (e.g., errorId for tracking).
 * Used for all error conditions (400, 404, 500, etc.).
 *
 * @param res - Express Response object
 * @param error - Error message
 * @param statusCode - HTTP status code (default: 400)
 * @param req - Optional Express Request for including request ID
 * @param extra - Optional extra data to include (e.g., { errorId: "123" })
 * @returns Express Response object for chaining
 */
export const sendError = (
  res: Response,
  error: string,
  statusCode = 400,
  req?: Request,
  extra?: any
): Response => {
  return res.status(statusCode).json({
    success: false,
    error,
    timestamp: new Date().toISOString(),
    ...(req?.id && { requestId: req.id }),
    ...extra,
  });
};
