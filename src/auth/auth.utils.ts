/**
 * src/auth/auth.utils.ts
 *
 * Authentication utilities for password hashing, JWT signing/verification.
 * Uses bcryptjs for secure password hashing and jsonwebtoken for JWT handling.
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const SALT_ROUNDS = 10; // Cost factor for bcrypt hashing

/**
 * Hash a plaintext password using bcrypt
 *
 * @param plain - Plaintext password to hash
 * @returns Hashed password with salt
 */
export const hashPassword = (plain: string) => bcrypt.hashSync(plain, SALT_ROUNDS);

/**
 * Compare a plaintext password with a bcrypt hash
 *
 * @param plain - Plaintext password to verify
 * @param hash - Bcrypt hash to compare against
 * @returns True if password matches hash, false otherwise
 */
export const comparePassword = (plain: string, hash: string) => bcrypt.compareSync(plain, hash);

/**
 * Sign a JWT token
 *
 * @param payload - Data to encode in token (typically { sub: userId })
 * @returns Signed JWT token with 1-hour expiration
 */
export const signJwt = (payload: object) =>
  jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1h' });

/**
 * Express middleware to verify JWT token from header or cookie
 *
 * Checks both Authorization header (Bearer token) and access_token cookie.
 * Attaches decoded payload to req.user for downstream handlers.
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next middleware function
 */
export const verifyJwt = (req: Request, res: Response, next: NextFunction) => {
  // Extract token from Authorization header or cookie
  const token = req.headers.authorization?.split(' ')[1] ?? req.cookies['access_token'];

  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    // Verify and decode token
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    // Attach decoded payload to request for downstream use
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
