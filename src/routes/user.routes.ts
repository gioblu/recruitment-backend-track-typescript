/**
 * src/routes/user.routes.ts
 *
 * User management API routes.
 * Provides CRUD endpoints for user accounts.
 * All endpoints require JWT authentication.
 */

import { Router } from 'express';
import { verifyJwt } from '../auth/auth.utils';
import {
  create,
  get,
  update,
  remove,
  list,
} from '../controllers/user.controller';

const router = Router();

/**
 * POST /api/user
 * Create a new user account
 * Requires: JWT authentication
 * Body: { email, password, name }
 * Returns: { user }
 */
router.post('/', verifyJwt, create);

/**
 * GET /api/user
 * List users with pagination and optional filtering
 * Requires: JWT authentication
 * Query: { page?, limit?, email?, name? }
 * Returns: { page, limit, data: [] }
 */
router.get('/', verifyJwt, list);

/**
 * GET /api/user/:id
 * Retrieve a specific user by ID
 * Requires: JWT authentication
 * Params: { id: number }
 * Returns: { user }
 */
router.get('/:id', verifyJwt, get);

/**
 * PATCH /api/user/:id
 * Update a user (partial fields allowed)
 * Requires: JWT authentication
 * Params: { id: number }
 * Body: { email?, password?, name? }
 * Returns: { user }
 */
router.patch('/:id', verifyJwt, update);

/**
 * DELETE /api/user/:id
 * Delete a user permanently
 * Requires: JWT authentication
 * Params: { id: number }
 * Returns: 204 No Content
 */
router.delete('/:id', verifyJwt, remove);

export default router;
