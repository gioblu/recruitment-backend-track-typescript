/**
 * src/controllers/user.controller.ts
 *
 * User management controller for CRUD operations.
 * Handles user creation, retrieval, updates, deletion, and listing with pagination.
 */

import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { User } from '@prisma/client';
import * as service from '../services/user.service';
import { hashPassword } from '../auth/auth.utils';
import { getPagination } from '../utils/pagination';
import { validateNumericId } from '../utils/validators';
import { sendSuccess, sendError } from '../utils/responses';
import { logError, logInfo } from '../utils/logger';
import {
  UserCreateSchema,
  UserUpdateSchema,
} from '../schemas/user.schema';

/**
 * CREATE: Register a new user
 *
 * @param req - Express request with user data (email, password, name)
 * @param res - Express response
 * @returns Created user object (201) or validation error (400/500)
 */
export const create = async (req: Request, res: Response) => {
  try {
    const result = UserCreateSchema.safeParse(req.body);
    if (!result.success) {
      logError('User validation failed', new Error('Invalid schema'));
      return sendError(res, 'Validation failed', 400, req);
    }

    // Hash password before storing
    const data = { ...result.data, password: hashPassword(result.data.password) };
    const user = await prisma.user.create({ data });

    logInfo('User created', { userId: user.id, email: user.email });
    return sendSuccess(res, user, 201, req);
  } catch (err: any) {
    logError('User creation failed', err);
    return sendError(res, 'Creation failed', 500, req);
  }
};

/**
 * READ: Retrieve a single user by ID
 *
 * @param req - Express request with userId in params
 * @param res - Express response
 * @returns User object (200) or error (400/404/500)
 */
export const get = async (req: Request, res: Response) => {
  try {
    const id = validateNumericId(req.params.id, 'User ID');
    const user = await service.getUser(id);

    if (!user) {
      logInfo('User not found', { userId: id });
      return sendError(res, 'Not found', 404, req);
    }

    return sendSuccess(res, user, 200, req);
  } catch (err: any) {
    logError('Get user failed', err, { userId: req.params.id });
    return sendError(res, err.message, 400, req);
  }
};

/**
 * UPDATE: Modify an existing user
 *
 * @param req - Express request with userId in params, update fields in body
 * @param res - Express response
 * @returns Updated user object (200) or error (400/500)
 */
export const update = async (req: Request, res: Response) => {
  try {
    const id = validateNumericId(req.params.id, 'User ID');
    const result = UserUpdateSchema.safeParse(req.body);

    if (!result.success) {
      logError('User update validation failed', new Error('Invalid schema'), { userId: id });
      return sendError(res, 'Validation failed', 400, req);
    }

    // Filter out undefined values (Prisma rejects them)
    const cleaned = Object.fromEntries(
      Object.entries(result.data).filter(([, v]) => v !== undefined)
    ) as Partial<User>;

    // Hash password if provided
    if (cleaned.password) cleaned.password = hashPassword(cleaned.password);

    const user = await service.updateUser(id, cleaned);
    logInfo('User updated', { userId: id, email: user.email });

    return sendSuccess(res, user, 200, req);
  } catch (err: any) {
    logError('User update failed', err, { userId: req.params.id });
    return sendError(res, err.message, 400, req);
  }
};

/**
 * DELETE: Remove a user
 *
 * @param req - Express request with userId in params
 * @param res - Express response
 * @returns No content (204) or error (400/500)
 */
export const remove = async (req: Request, res: Response) => {
  try {
    const id = validateNumericId(req.params.id, 'User ID');
    await service.deleteUser(id);

    logInfo('User deleted', { userId: id });
    res.status(204).send();
  } catch (err: any) {
    logError('User deletion failed', err, { userId: req.params.id });
    return sendError(res, err.message, 400, req);
  }
};

/**
 * LIST: Retrieve users with pagination and filters
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - email: Filter by email (substring match)
 * - name: Filter by name (substring match)
 *
 * @param req - Express request with pagination and filter params
 * @param res - Express response
 * @returns Paginated user list (200) or error (500)
 */
export const list = async (req: Request, res: Response) => {
  try {
    const { page, limit } = getPagination(req.query);
    const filter: any = {};

    // Apply optional filters
    if (req.query.email) filter.email = { contains: String(req.query.email) };
    if (req.query.name) filter.name = { contains: String(req.query.name) };

    const users = await service.listUsers(page, limit, filter);

    logInfo('Users listed', { page, limit, count: users.length });
    return sendSuccess(res, { page, limit, data: users }, 200, req);
  } catch (err: any) {
    logError('List users failed', err);
    return sendError(res, 'List failed', 500, req);
  }
};
