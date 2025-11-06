/**
 * src/routes/auth.routes.ts
 *
 * Authentication API routes.
 * Handles user registration, login, and logout.
 * Only logout requires authentication via JWT verification.
 */

import { Router } from 'express';
import { verifyJwt } from '../auth/auth.utils';
import { register, login, logout } from '../controllers/auth.controller';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user account
 * Body: { email, password, name }
 * Returns: { token, user }
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Login with existing credentials
 * Body: { email, password }
 * Returns: { token, user }
 */
router.post('/login', login);

/**
 * POST /api/auth/logout
 * Logout current user (clears auth cookie)
 * Requires: JWT token in Authorization header or access_token cookie
 * Returns: { message }
 */
router.post('/logout', verifyJwt, logout);

export default router;
