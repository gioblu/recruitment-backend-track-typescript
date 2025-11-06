/**
 * src/services/user.service.ts
 *
 * User service layer containing data access operations.
 * Abstracts Prisma calls for cleaner controller logic.
 */

import { prisma } from '../prisma';
import type { User } from '@prisma/client';

/**
 * Create a new user
 *
 * @param data - User data (email, password, name)
 * @returns Created user record
 */
export const createUser = (data: User) => prisma.user.create({ data });

/**
 * Retrieve a user by ID
 *
 * @param id - User ID
 * @returns User record or null if not found
 */
export const getUser = (id: number) => prisma.user.findUnique({ where: { id } });

/**
 * Update a user's fields
 *
 * @param id - User ID
 * @param data - Fields to update
 * @returns Updated user record
 */
export const updateUser = (id: number, data: Partial<User>) =>
  prisma.user.update({ where: { id }, data });

/**
 * Delete a user
 *
 * @param id - User ID
 * @returns Deleted user record
 */
export const deleteUser = (id: number) => prisma.user.delete({ where: { id } });

/**
 * List users with pagination and optional filtering
 *
 * @param page - Page number (1-indexed, default: 1)
 * @param limit - Items per page (default: 10)
 * @param filter - Optional Prisma where clause for filtering
 * @returns Array of user records
 */
export const listUsers = (page = 1, limit = 10, filter = {}) => {
  const skip = (page - 1) * limit;
  return prisma.user.findMany({
    where: filter,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
};
