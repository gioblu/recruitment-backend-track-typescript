/**
 * src/utils/validators.ts
 *
 * Validation helpers for common data types and formats.
 * Used across controllers to ensure data integrity.
 */

/**
 * Validate and parse a numeric ID from request parameters
 *
 * Ensures the ID is a positive integer. Used for all resource lookups.
 *
 * @param id - The ID value to validate (typically from req.params)
 * @param fieldName - Optional field name for error messages (e.g., "Invoice ID")
 * @returns Parsed numeric ID
 * @throws Error if ID format is invalid
 */
export function validateNumericId(id: any, fieldName = 'ID'): number {
  const parsed = Number(id);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${fieldName} format. Must be a positive integer.`);
  }

  return parsed;
}
