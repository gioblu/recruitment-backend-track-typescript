/**
 * src/schemas/user.schema.ts
 *
 * Zod validation schemas for user-related API operations.
 * Includes reusable field validators and operation-specific schemas.
 * Integrates with zod-openapi for automatic OpenAPI documentation.
 */

import { z } from 'zod';
import 'zod-openapi';

/**
 * Reusable field validators
 */

export const UserId = z
  .number()
  .int()
  .positive()
  .meta({
    description: 'Numeric user identifier',
    example: 42,
    id: 'UserId'
  });

export const Email = z
  .string()
  .email()
  .meta({
    description: 'User email address (unique constraint)',
    example: 'alice@example.com',
    id: 'Email',
  });

export const Password = z
  .string()
  .min(12, 'Password should be at least 12 characters!')
  .meta({
    description: 'Password (plaintext before hashing, bcrypt hashed in storage)',
    example: 'SuperSecret123!',
  });

export const Name = z
  .string()
  .meta({
    description: 'User full name',
    example: 'Alice Doe',
    id: 'UserName',
  });

/**
 * Operation schemas
 */

export const UserCreateSchema = z.object({
  email: Email,
  password: Password,
  name: Name,
}).meta({
  description: 'Payload for creating a new user account',
  id: 'UserCreate',
});

export const UserUpdateSchema = UserCreateSchema.partial().meta({
  description: 'Payload for partially updating a user (all fields optional)',
  id: 'UserUpdate',
});

export const UserResponseSchema = z.object({
  id: UserId,
  email: Email,
  name: Name,
}).meta({
  description: 'User object returned by the API (password excluded)',
  id: 'UserResponse',
});
