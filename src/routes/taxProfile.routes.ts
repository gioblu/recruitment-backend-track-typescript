/**
 * src/routes/taxProfile.routes.ts
 *
 * Tax profile management API routes.
 * Provides CRUD endpoints for tax configurations.
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
} from '../controllers/taxProfile.controller';

const router = Router();

/**
 * POST /api/taxProfiles
 * Create a new tax profile
 * Requires: JWT authentication
 * Body: { userId, name, tax_id_number, address }
 * Returns: { taxProfile }
 */
router.post('/', verifyJwt, create);

/**
 * GET /api/taxProfiles
 * List tax profiles with pagination and optional filtering
 * Requires: JWT authentication
 * Query: { page?, limit?, name?, userId?, tax_id_number? }
 * Returns: { page, limit, total, data: [] }
 */
router.get('/', verifyJwt, list);

/**
 * GET /api/taxProfiles/:id
 * Retrieve a specific tax profile by ID
 * Requires: JWT authentication
 * Params: { id: number }
 * Returns: { taxProfile }
 */
router.get('/:id', verifyJwt, get);

/**
 * PATCH /api/taxProfiles/:id
 * Update a tax profile (partial fields allowed)
 * Requires: JWT authentication
 * Params: { id: number }
 * Body: { userId?, name?, tax_id_number?, address? }
 * Returns: { taxProfile }
 */
router.patch('/:id', verifyJwt, update);

/**
 * DELETE /api/taxProfiles/:id
 * Delete a tax profile permanently
 * Requires: JWT authentication
 * Params: { id: number }
 * Returns: 204 No Content
 */
router.delete('/:id', verifyJwt, remove);

export default router;
