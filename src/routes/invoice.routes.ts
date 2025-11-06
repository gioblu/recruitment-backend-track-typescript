/**
 * src/routes/invoice.routes.ts
 *
 * Invoice management API routes.
 * Provides CRUD endpoints for invoices with financial data.
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
} from '../controllers/invoice.controller';

const router = Router();

/**
 * POST /api/invoices
 * Create a new invoice
 * Requires: JWT authentication
 * Body: { taxProfileId, amount, status, issuedAt? }
 * Returns: { invoice }
 */
router.post('/', verifyJwt, create);

/**
 * GET /api/invoices
 * List invoices with pagination and optional filtering
 * Requires: JWT authentication
 * Query: { page?, limit?, status?, email?, minAmount?, maxAmount? }
 * Returns: { page, limit, total, data: [] }
 */
router.get('/', verifyJwt, list);

/**
 * GET /api/invoices/:id
 * Retrieve a specific invoice by ID
 * Requires: JWT authentication
 * Params: { id: number }
 * Returns: { invoice }
 */
router.get('/:id', verifyJwt, get);

/**
 * PATCH /api/invoices/:id
 * Update an invoice (partial fields allowed)
 * Requires: JWT authentication
 * Params: { id: number }
 * Body: { taxProfileId?, amount?, status?, issuedAt? }
 * Returns: { invoice }
 */
router.patch('/:id', verifyJwt, update);

/**
 * DELETE /api/invoices/:id
 * Delete an invoice permanently
 * Requires: JWT authentication
 * Params: { id: number }
 * Returns: 204 No Content
 */
router.delete('/:id', verifyJwt, remove);

export default router;
