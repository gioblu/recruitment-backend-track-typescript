/**
 * src/schemas/invoice.schema.ts
 *
 * Zod validation schemas for invoice API operations.
 * Handles Decimal precision for financial amounts.
 * Includes reusable field validators and operation-specific schemas.
 */

import { z } from 'zod';
import { Prisma } from '@prisma/client';
import 'zod-openapi';

/**
 * Reusable field validators
 */

export const InvoiceId = z
  .number()
  .int()
  .positive()
  .meta({
    description: 'Numeric invoice identifier (auto-increment)',
    example: 1,
    id: 'InvoiceId',
  });

export const TaxProfileId = z
  .number()
  .int()
  .positive()
  .meta({
    description: 'Foreign key reference to tax profile',
    example: 1,
    id: 'InvoiceTaxProfileId',
  });

export const InvoiceAmount = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a decimal with up to 2 places')
  .transform(v => new Prisma.Decimal(v))
  .meta({
    description: 'Invoice amount in decimal format (up to 2 decimal places)',
    example: '100.55',
    id: 'InvoiceAmount',
  });

export const InvoiceStatus = z
  .enum(['draft', 'sent', 'paid'])
  .meta({
    description: 'Invoice lifecycle status',
    example: 'draft',
    id: 'InvoiceStatus',
  });

export const InvoiceIssuedAt = z
  .string()
  .optional()
  .transform(v => (v ? new Date(v) : new Date()))
  .meta({
    description: 'Date and time the invoice was issued (ISO 8601)',
    example: '2025-11-06T12:00:00Z',
    id: 'InvoiceIssuedAt',
  });

/**
 * Operation schemas
 */

export const InvoiceCreateSchema = z.object({
  taxProfileId: TaxProfileId,
  amount: InvoiceAmount,
  status: InvoiceStatus,
  issuedAt: InvoiceIssuedAt,
}).meta({
  description: 'Payload for creating a new invoice',
  id: 'InvoiceCreate',
});

export const InvoiceUpdateSchema = InvoiceCreateSchema.partial().meta({
  description: 'Payload for partially updating an invoice (all fields optional)',
  id: 'InvoiceUpdate',
});

export const InvoiceResponseSchema = z.object({
  id: InvoiceId,
  taxProfileId: TaxProfileId,
  amount: InvoiceAmount,
  status: InvoiceStatus,
  issuedAt: InvoiceIssuedAt,
}).meta({
  description: 'Invoice object returned by the API',
  id: 'InvoiceResponse',
});
