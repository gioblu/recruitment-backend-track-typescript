/**
 * src/schemas/taxProfile.schema.ts
 *
 * Zod validation schemas for tax profile API operations.
 * Validates tax identification numbers and business addresses.
 * Includes reusable field validators and operation-specific schemas.
 */

import { z } from 'zod';
import 'zod-openapi';

/**
 * Reusable field validators
 */

export const TaxProfileId = z
  .number()
  .int()
  .positive()
  .meta({
    description: 'Numeric tax profile identifier (auto-increment)',
    example: 1,
    id: 'TaxProfileId',
  });

export const TaxProfileUserId = z
  .number()
  .int()
  .positive()
  .meta({
    description: 'Foreign key reference to user',
    example: 1,
    id: 'TaxProfileUserId',
  });

export const TaxProfileName = z
  .string()
  .min(1, 'Name is required')
  .meta({
    description: 'Tax profile name/label (e.g., "Primary Business", "Consulting")',
    example: 'Primary Business',
    id: 'TaxProfileName',
  });

export const TaxProfileTaxIdNumber = z
  .string()
  .min(5, 'Tax ID number must be at least 5 characters')
  .max(30, 'Tax ID number must be at most 30 characters')
  .regex(/^[A-Z0-9\-]+$/i, 'Tax ID number can only contain alphanumeric characters and hyphens')
  .meta({
    description: 'Tax identification number (VAT ID, TIN, EIN, etc.)',
    example: 'US12-3456789',
    id: 'TaxProfileTaxIdNumber',
  });

export const TaxProfileAddress = z
  .string()
  .min(10, 'Address must be at least 10 characters')
  .max(255, 'Address must be at most 255 characters')
  .meta({
    description: 'Physical or business address associated with tax profile',
    example: '123 Business Street, New York, NY 10001, USA',
    id: 'TaxProfileAddress',
  });

/**
 * Operation schemas
 */

export const TaxProfileCreateSchema = z.object({
  userId: TaxProfileUserId,
  name: TaxProfileName,
  tax_id_number: TaxProfileTaxIdNumber,
  address: TaxProfileAddress,
}).meta({
  description: 'Payload for creating a new tax profile',
  id: 'TaxProfileCreate',
});

export const TaxProfileUpdateSchema = TaxProfileCreateSchema.partial().meta({
  description: 'Payload for partially updating a tax profile (all fields optional)',
  id: 'TaxProfileUpdate',
});

export const TaxProfileResponseSchema = z.object({
  id: TaxProfileId,
  userId: TaxProfileUserId,
  name: TaxProfileName,
  tax_id_number: TaxProfileTaxIdNumber,
  address: TaxProfileAddress,
}).meta({
  description: 'Tax profile object returned by the API',
  id: 'TaxProfileResponse',
});
