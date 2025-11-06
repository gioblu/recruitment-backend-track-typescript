/**
 * src/controllers/invoice.controller.ts
 *
 * Invoice management controller for CRUD operations.
 * Handles invoice lifecycle: creation, retrieval, updates, deletion, and filtered listing.
 * Manages financial data with Decimal precision for accuracy.
 */

import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';
import {
  InvoiceCreateSchema,
  InvoiceUpdateSchema,
} from '../schemas/invoice.schema';
import { validateNumericId } from '../utils/validators';
import { sendSuccess, sendError } from '../utils/responses';
import { logInfo, logError } from '../utils/logger';

/**
 * Helper: Remove undefined values from object
 *
 * Prisma does not accept undefined values in update operations.
 * This function filters them out before passing to the ORM.
 */
function cleanUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

/**
 * CREATE: Add a new invoice
 *
 * @param req - Express request with invoice data (userId, taxProfileId, amount, status)
 * @param res - Express response
 * @returns Created invoice object (201) or validation/server error (400/500)
 */
export const create = async (req: Request, res: Response) => {
  const parsed = InvoiceCreateSchema.safeParse(req.body);

  if (!parsed.success) {
    logError('Invoice validation failed', new Error('Invalid invoice data'));
    return sendError(res, 'Validation failed', 400, req);
  }

  try {
    const invoice = await prisma.invoice.create({ data: parsed.data });

    logInfo('Invoice created', {
      invoiceId: invoice.id,
      amount: invoice.amount.toString(),
      status: invoice.status,
    });

    return sendSuccess(res, invoice, 201, req);
  } catch (err: any) {
    logError('Invoice creation failed', err, {
      amount: parsed.data.amount.toString(),
    });
    return sendError(res, 'Internal server error', 500, req);
  }
};

/**
 * READ: Retrieve a single invoice by ID
 *
 * @param req - Express request with invoiceId in params
 * @param res - Express response
 * @returns Invoice object (200) or error (400/404/500)
 */
export const get = async (req: Request, res: Response) => {
  try {
    const id = validateNumericId(req.params.id, 'Invoice ID');
    const invoice = await prisma.invoice.findUnique({ where: { id } });

    if (!invoice) {
      logInfo('Invoice not found', { invoiceId: id });
      return sendError(res, 'Not found', 404, req);
    }

    return sendSuccess(res, invoice, 200, req);
  } catch (err: any) {
    logError('Get invoice failed', err, { invoiceId: req.params.id });
    return sendError(res, err.message, 400, req);
  }
};

/**
 * UPDATE: Modify an existing invoice
 *
 * @param req - Express request with invoiceId in params, update fields in body
 * @param res - Express response
 * @returns Updated invoice object (200) or error (400/500)
 */
export const update = async (req: Request, res: Response) => {
  try {
    const id = validateNumericId(req.params.id, 'Invoice ID');
    const parsed = InvoiceUpdateSchema.safeParse(req.body);

    if (!parsed.success) {
      logError('Invoice update validation failed', new Error('Invalid update data'));
      return sendError(res, 'Validation failed', 400, req);
    }

    // Remove undefined keys (Prisma rejects them)
    const data = cleanUndefined(parsed.data) as Prisma.InvoiceUpdateInput;

    const invoice = await prisma.invoice.update({ where: { id }, data });

    logInfo('Invoice updated', {
      invoiceId: id,
      status: invoice.status,
    });

    return sendSuccess(res, invoice, 200, req);
  } catch (err: any) {
    logError('Invoice update failed', err, { invoiceId: req.params.id });
    return sendError(res, err.message, 400, req);
  }
};

/**
 * DELETE: Remove an invoice
 *
 * @param req - Express request with invoiceId in params
 * @param res - Express response
 * @returns No content (204) or error (400/404/500)
 */
export const remove = async (req: Request, res: Response) => {
  try {
    const id = validateNumericId(req.params.id, 'Invoice ID');
    await prisma.invoice.delete({ where: { id } });

    logInfo('Invoice deleted', { invoiceId: id });
    res.status(204).send();
  } catch (err: any) {
    // Handle Prisma "not found" error (P2025)
    if (err.code === 'P2025') {
      logInfo('Invoice not found for deletion', { invoiceId: req.params.id });
      return sendError(res, 'Not found', 404, req);
    }

    logError('Invoice deletion failed', err, { invoiceId: req.params.id });
    return sendError(res, err.message, 400, req);
  }
};

/**
 * LIST: Retrieve invoices with pagination and filters
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - status: Filter by status (draft, sent, paid)
 * - email: Filter by user email (requires join with taxProfile)
 * - minAmount: Filter invoices >= amount
 * - maxAmount: Filter invoices <= amount
 *
 * @param req - Express request with pagination and filter params
 * @param res - Express response
 * @returns Paginated invoice list with total count (200) or error (500)
 */
export const list = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: any = {};

  // Apply optional filters
  if (req.query.status) filter.status = String(req.query.status);
  if (req.query.email) {
    filter.taxProfile = {
      user: { email: { contains: String(req.query.email), mode: 'insensitive' } }
    };
  }

  // Range filtering with Decimal support
  if (req.query.minAmount) {
    filter.amount = { gte: new Prisma.Decimal(String(req.query.minAmount)) };
  }
  if (req.query.maxAmount) {
    filter.amount = {
      ...(filter.amount || {}),
      lte: new Prisma.Decimal(String(req.query.maxAmount)),
    };
  }

  try {
    // Fetch count and records in parallel for efficiency
    const [total, invoices] = await Promise.all([
      prisma.invoice.count({ where: filter }),
      prisma.invoice.findMany({
        where: filter,
        include: { taxProfile: { include: { user: true } } },
        skip,
        take: limit,
        orderBy: { issuedAt: 'desc' },
      }),
    ]);

    logInfo('Invoices listed', {
      page,
      limit,
      total,
      count: invoices.length,
    });

    return sendSuccess(res, { page, limit, total, data: invoices }, 200, req);
  } catch (err: any) {
    logError('List invoices failed', err);
    return sendError(res, 'Internal server error', 500, req);
  }
};
