/**
 * src/utils/pagination.ts
 *
 * Pagination utilities for list endpoints.
 * Handles safe extraction and validation of page/limit query parameters.
 */

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

/**
 * Extract and validate pagination parameters from request query
 *
 * Safely converts raw query values to validated pagination parameters.
 * Applies defaults when missing or invalid, and enforces maximum limit.
 *
 * @param query - Request query object from Express
 * @returns Validated pagination object { page, limit }
 *
 * @example
 * getPagination({ page: "5", limit: "50" }) // { page: 5, limit: 50 }
 * getPagination({ page: "-1", limit: "999" }) // { page: 1, limit: 100 }
 * getPagination({}) // { page: 1, limit: 10 }
 */
export function getPagination(query: Record<string, unknown>) {
  const rawPage = Number(query.page);
  const rawLimit = Number(query.limit);

  // Validate page: default to 1 if invalid or less than 1
  const page = Number.isNaN(rawPage) || rawPage < 1 ? DEFAULT_PAGE : rawPage;

  // Validate limit: default to 10, cap at MAX_LIMIT to prevent abuse
  const limit = Number.isNaN(rawLimit) || rawLimit < 1
    ? DEFAULT_LIMIT
    : Math.min(rawLimit, MAX_LIMIT);

  return { page, limit };
}
