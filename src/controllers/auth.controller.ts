/**
 * src/controllers/auth.controller.ts
 *
 * Authentication controller handling user registration, login, and logout.
 * Manages JWT token generation and password hashing with bcrypt.
 */

import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { hashPassword, comparePassword, signJwt } from '../auth/auth.utils';
import { sendSuccess, sendError } from '../utils/responses';
import { logAuthEvent, logError } from '../utils/logger';

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Register a new user account
 *
 * @param req - Express request with email, password, name in body
 * @param res - Express response
 * @returns User object and JWT token on success (201), error on failure
 */
export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  try {
    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      logAuthEvent('register', email, false, { reason: 'duplicate_email' });
      return sendError(res, 'Email already used', 409, req);
    }

    // Create new user with hashed password
    const user = await prisma.user.create({
      data: { email, password: hashPassword(password), name },
    });

    // Generate JWT token
    const token = signJwt({ sub: user.id });

    // Set secure cookie with token
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: COOKIE_MAX_AGE,
    });

    logAuthEvent('register', email, true, { userId: user.id });

    return sendSuccess(res, { token, user: { id: user.id, email, name } }, 201, req);
  } catch (err: any) {
    // Handle unique constraint violations from Prisma
    if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
      logAuthEvent('register', email, false, { reason: 'constraint_violation' });
      return sendError(res, 'Email already used', 409, req);
    }

    logError('Registration error', err, { email });
    return sendError(res, 'Registration failed', 500, req);
  }
};

/**
 * Login with existing credentials
 *
 * @param req - Express request with email and password in body
 * @param res - Express response
 * @returns User object and JWT token on success (200), error on failure
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Retrieve user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !comparePassword(password, user.password)) {
      logAuthEvent('login', email, false, { reason: 'invalid_credentials' });
      return sendError(res, 'Invalid credentials', 401, req);
    }

    // Generate JWT token
    const token = signJwt({ sub: user.id });

    // Set secure cookie with token
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: COOKIE_MAX_AGE,
    });

    logAuthEvent('login', email, true, { userId: user.id });

    return sendSuccess(res, { token, user: { id: user.id, email: user.email, name: user.name } }, 200, req);
  } catch (err: any) {
    logError('Login error', err, { email });
    return sendError(res, 'Login failed', 500, req);
  }
};

/**
 * Logout user session
 *
 * @param req - Express request with JWT in cookie
 * @param res - Express response
 * @returns Success message on logout (200)
 */
export const logout = async (req: Request, res: Response) => {
  try {
    // Clear authentication cookie
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    // Extract userId from JWT payload attached by auth middleware
    const userId = (req as any).user?.sub || 'unknown';
    logAuthEvent('logout', `user_${userId}`, true, { userId });

    return sendSuccess(res, { message: 'Logged out' }, 200, req);
  } catch (err: any) {
    logError('Logout error', err);
    return sendError(res, 'Logout failed', 500, req);
  }
};
