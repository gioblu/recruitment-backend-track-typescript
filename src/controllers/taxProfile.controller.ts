/**
 * src/controllers/taxProfile.controller.ts
 *
 * Tax profile management controller for CRUD operations.
 * Handles tax profile configuration: creation, retrieval, updates, deletion, and listing.
 * Manages tax identification numbers and business addresses.
 */

import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';
import {
  TaxProfileCreateSchema,
  TaxProfileUpdateSchema,
} from '../schemas/taxProfile.schema';
import { validateNumericId } from '../utils/validators';
import { sendSuccess, sendError } from '../utils/responses';
import { logInfo, logError } from '../utils/logger';

/**
 * Helper: Remove undefined values from object
 *
 * Prisma rejects undefined values in update operations.
 * This function filters them out before passing to the ORM.
 */
function cleanUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

/**
 * CREATE: Add a new tax profile
 *
 * @param req - Express request with tax profile data (userId, name, tax_id_number, address)
 * @param res - Express response
 * @returns Created tax profile object (201) or validation/server error (400/500)
 */
export const create = async (req: Request, res: Response) => {
  const parsed = TaxProfileCreateSchema.safeParse(req.body);

  if (!parsed.success) {
    logError('Tax profile validation failed', new Error('Invalid tax profile data'));
    return sendError(res, 'Validation failed', 400, req);
  }

  try {
    const profile = await prisma.taxProfile.create({ data: parsed.data });

    logInfo('Tax profile created', {
      profileId: profile.id,
      name: profile.name,
      tax_id_number: profile.tax_id_number,
    });

    return sendSuccess(res, profile, 201, req);
  } catch (err: any) {
    logError('Tax profile creation failed', err);
    return sendError(res, 'Internal server error', 500, req);
  }
};

/**
 * READ: Retrieve a single tax profile by ID
 *
 * @param req - Express request with profileId in params
 * @param res - Express response
 * @returns Tax profile object (200) or error (400/404/500)
 */
export const get = async (req: Request, res: Response) => {
  try {
    const id = validateNumericId(req.params.id, 'Tax Profile ID');
    const profile = await prisma.taxProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      logInfo('Tax profile not found', { profileId: id });
      return sendError(res, 'Not found', 404, req);
    }

    return sendSuccess(res, profile, 200, req);
  } catch (err: any) {
    logError('Get tax profile failed', err, { profileId: req.params.id });
    return sendError(res, err.message, 400, req);
  }
};

/**
 * UPDATE: Modify an existing tax profile
 *
 * @param req - Express request with profileId in params, update fields in body
 * @param res - Express response
 * @returns Updated tax profile object (200) or error (400/500)
 */
export const update = async (req: Request, res: Response) => {
  try {
    const id = validateNumericId(req.params.id, 'Tax Profile ID');
    const parsed = TaxProfileUpdateSchema.safeParse(req.body);

    if (!parsed.success) {
      logError('Tax profile update validation failed', new Error('Invalid update data'));
      return sendError(res, 'Validation failed', 400, req);
    }

    // Remove undefined keys (Prisma rejects them)
    const data = cleanUndefined(parsed.data) as Prisma.TaxProfileUpdateInput;

    const profile = await prisma.taxProfile.update({
      where: { id },
      data,
    });

    logInfo('Tax profile updated', {
      profileId: id,
      name: profile.name,
      tax_id_number: profile.tax_id_number,
    });

    return sendSuccess(res, profile, 200, req);
  } catch (err: any) {
    logError('Tax profile update failed', err, { profileId: req.params.id });
    return sendError(res, err.message, 400, req);
  }
};

/**
 * DELETE: Remove a tax profile
 *
 * @param req - Express request with profileId in params
 * @param res - Express response
 * @returns No content (204) or error (400/404/500)
 */
export const remove = async (req: Request, res: Response) => {
  try {
    const id = validateNumericId(req.params.id, 'Tax Profile ID');
    await prisma.taxProfile.delete({ where: { id } });

    logInfo('Tax profile deleted', { profileId: id });
    res.status(204).send();
  } catch (err: any) {
    // Handle Prisma "not found" error (P2025)
    if (err.code === 'P2025') {
      logInfo('Tax profile not found for deletion', { profileId: req.params.id });
      return sendError(res, 'Not found', 404, req);
    }

    logError('Tax profile deletion failed', err, { profileId: req.params.id });
    return sendError(res, err.message, 400, req);
  }
};

/**
 * LIST: Retrieve tax profiles with pagination and filters
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - name: Filter by name (substring match)
 * - userId: Filter by user ID
 * - tax_id_number: Filter by tax ID number
 *
 * @param req - Express request with pagination and filter params
 * @param res - Express response
 * @returns Paginated tax profile list with total count (200) or error (500)
 */
export const list = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: any = {};

  // Apply optional filters
  if (req.query.name) filter.name = { contains: String(req.query.name) };
  if (req.query.userId) filter.userId = validateNumericId(req.query.userId);
  if (req.query.tax_id_number) filter.tax_id_number = { contains: String(req.query.tax_id_number) };

  try {
    // Fetch count and records in parallel for efficiency
    const [total, profiles] = await Promise.all([
      prisma.taxProfile.count({ where: filter }),
      prisma.taxProfile.findMany({
        where: filter,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
    ]);

    logInfo('Tax profiles listed', {
      page,
      limit,
      total,
      count: profiles.length,
    });

    return sendSuccess(res, { page, limit, total, data: profiles }, 200, req);
  } catch (err: any) {
    logError('List tax profiles failed', err);
    return sendError(res, 'Internal server error', 500, req);
  }
};
