// src/openapi/spec.ts
import { createDocument } from 'zod-openapi';
import {
  UserCreateSchema,
  UserUpdateSchema,
  UserResponseSchema,
  UserId,
  Email,
  Name,
} from '../schemas/user.schema';
import {
  TaxProfileId,
  TaxProfileCreateSchema,
  TaxProfileUpdateSchema,
  TaxProfileResponseSchema,
} from '../schemas/taxProfile.schema';
import {
  InvoiceId,
  InvoiceCreateSchema,
  InvoiceUpdateSchema,
  InvoiceResponseSchema,
} from '../schemas/invoice.schema';
import { z } from 'zod';

export const openapiSpec = createDocument({
  openapi: '3.1.0',
  info: {
    title: 'recruitment-backend-track-typescript',
    version: '1.0.0',
    description: 'CRUD endpoints for User, TaxProfile, and Invoice resources',
  },
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: UserCreateSchema },
          },
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: z.object({
                  token: z.string(),
                  user: UserResponseSchema,
                }),
              },
            },
          },
          '409': { description: 'Email already in use' },
          '400': { description: 'Validation error' },
        },
      },
    },

    '/api/auth/login': {
      post: {
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: z.object({
                email: Email,
                password: z.string(),
              }),
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: z.object({
                  token: z.string(),
                  user: UserResponseSchema,
                }),
              },
            },
          },
          '401': { description: 'Invalid credentials' },
          '400': { description: 'Validation error' },
        },
      },
    },

    '/api/auth/logout': {
      post: {
        summary: 'Logout user',
        responses: {
          '200': {
            description: 'Logout successful',
            content: {
              'application/json': {
                schema: z.object({
                  message: z.string(),
                }),
              },
            },
          },
        },
      },
    },

    '/api/user': {
      post: {
        summary: 'Create a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: UserCreateSchema },
          },
        },
        responses: {
          '201': {
            description: 'User created',
            content: {
              'application/json': { schema: UserResponseSchema },
            },
          },
          '400': { description: 'Validation error' },
        },
      },
      get: {
        summary: 'List users (paginated)',
        requestParams: {
          query: z.object({
            page: z
              .number()
              .int()
              .positive()
              .default(1)
              .meta({ description: 'Page number', example: 1 }),
            limit: z
              .number()
              .int()
              .positive()
              .default(10)
              .meta({ description: 'Items per page', example: 10 }),
            email: Email.optional(),
            name: Name.optional(),
          }),
        },
        responses: {
          '200': {
            description: 'Paginated list of users',
            content: {
              'application/json': {
                schema: z.object({
                  page: z.number(),
                  limit: z.number(),
                  data: z.array(UserResponseSchema),
                }),
              },
            },
          },
        },
      },
    },

    '/api/user/{id}': {
      get: {
        summary: 'Get a user by ID',
        requestParams: {
          path: z
            .object({ id: UserId })
            .meta({ param: { name: 'id', in: 'path' } }), 
        },
        responses: {
          '200': {
            description: 'User object',
            content: { 'application/json': { schema: UserResponseSchema } },
          },
          '404': { description: 'User not found' },
        },
      },

      patch: {
        summary: 'Partially update a user',
        requestParams: {
          path: z
            .object({ id: UserId })
            .meta({ param: { name: 'id', in: 'path' } }),
        },
        requestBody: {
          required: true,
          content: { 'application/json': { schema: UserUpdateSchema } },
        },
        responses: {
          '200': {
            description: 'Updated user',
            content: { 'application/json': { schema: UserResponseSchema } },
          },
          '400': { description: 'Validation error' },
          '404': { description: 'User not found' },
        },
      },

      delete: {
        summary: 'Delete a user',
        requestParams: {
          path: z
            .object({ id: UserId })
            .meta({ param: { name: 'id', in: 'path' } }),
        },
        responses: {
          '204': { description: 'No content' },
          '404': { description: 'User not found' },
        },
      },
    },

    '/api/taxProfiles': {
      post: {
        summary: 'Create a new tax profile',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: TaxProfileCreateSchema },
          },
        },
        responses: {
          '201': {
            description: 'Tax profile created',
            content: {
              'application/json': { schema: TaxProfileResponseSchema },
            },
          },
          '400': { description: 'Validation error' },
        },
      },
      get: {
        summary: 'List tax profiles (paginated)',
        requestParams: {
          query: z.object({
            page: z
              .number()
              .int()
              .positive()
              .default(1)
              .meta({ description: 'Page number', example: 1 }),
            limit: z
              .number()
              .int()
              .positive()
              .default(10)
              .meta({ description: 'Items per page', example: 10 }),
            name: z.string().optional().meta({ description: 'Filter by name' }),
            userId: z.number().int().optional().meta({ description: 'Filter by user ID' }),
            tax_id_number: z.string().optional().meta({ description: 'Filter by tax ID number' }),
          }),
        },
        responses: {
          '200': {
            description: 'Paginated list of tax profiles',
            content: {
              'application/json': {
                schema: z.object({
                  page: z.number(),
                  limit: z.number(),
                  data: z.array(TaxProfileResponseSchema),
                }),
              },
            },
          },
        },
      },
    },

    '/api/taxProfiles/{id}': {
      get: {
        summary: 'Get a tax profile by ID',
        requestParams: {
          path: z
            .object({ id: TaxProfileId })
            .meta({ param: { name: 'id', in: 'path' } }),
        },
        responses: {
          '200': {
            description: 'Tax profile object',
            content: { 'application/json': { schema: TaxProfileResponseSchema } },
          },
          '404': { description: 'Tax profile not found' },
        },
      },

      patch: {
        summary: 'Partially update a tax profile',
        requestParams: {
          path: z
            .object({ id: TaxProfileId })
            .meta({ param: { name: 'id', in: 'path' } }),
        },
        requestBody: {
          required: true,
          content: { 'application/json': { schema: TaxProfileUpdateSchema } },
        },
        responses: {
          '200': {
            description: 'Updated tax profile',
            content: { 'application/json': { schema: TaxProfileResponseSchema } },
          },
          '400': { description: 'Validation error' },
          '404': { description: 'Tax profile not found' },
        },
      },

      delete: {
        summary: 'Delete a tax profile',
        requestParams: {
          path: z
            .object({ id: TaxProfileId })
            .meta({ param: { name: 'id', in: 'path' } }),
        },
        responses: {
          '204': { description: 'No content' },
          '404': { description: 'Tax profile not found' },
        },
      },
    },

    '/api/invoices': {
      post: {
        summary: 'Create a new invoice',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: InvoiceCreateSchema },
          },
        },
        responses: {
          '201': {
            description: 'Invoice created',
            content: {
              'application/json': { schema: InvoiceResponseSchema },
            },
          },
          '400': { description: 'Validation error' },
        },
      },
      get: {
        summary: 'List invoices (paginated)',
        requestParams: {
          query: z.object({
            page: z
              .number()
              .int()
              .positive()
              .default(1)
              .meta({ description: 'Page number', example: 1 }),
            limit: z
              .number()
              .int()
              .positive()
              .default(10)
              .meta({ description: 'Items per page', example: 10 }),
            status: z.string().optional().meta({ description: 'Filter by status' }),
            minAmount: z.number().optional().meta({ description: 'Minimum amount filter' }),
            maxAmount: z.number().optional().meta({ description: 'Maximum amount filter' }),
          }),
        },
        responses: {
          '200': {
            description: 'Paginated list of invoices',
            content: {
              'application/json': {
                schema: z.object({
                  page: z.number(),
                  limit: z.number(),
                  total: z.number(),
                  data: z.array(InvoiceResponseSchema),
                }),
              },
            },
          },
        },
      },
    },

    '/api/invoices/{id}': {
      get: {
        summary: 'Get an invoice by ID',
        requestParams: {
          path: z
            .object({ id: InvoiceId })
            .meta({ param: { name: 'id', in: 'path' } }),
        },
        responses: {
          '200': {
            description: 'Invoice object',
            content: { 'application/json': { schema: InvoiceResponseSchema } },
          },
          '404': { description: 'Invoice not found' },
        },
      },

      patch: {
        summary: 'Partially update an invoice',
        requestParams: {
          path: z
            .object({ id: InvoiceId })
            .meta({ param: { name: 'id', in: 'path' } }),
        },
        requestBody: {
          required: true,
          content: { 'application/json': { schema: InvoiceUpdateSchema } },
        },
        responses: {
          '200': {
            description: 'Updated invoice',
            content: { 'application/json': { schema: InvoiceResponseSchema } },
          },
          '400': { description: 'Validation error' },
          '404': { description: 'Invoice not found' },
        },
      },

      delete: {
        summary: 'Delete an invoice',
        requestParams: {
          path: z
            .object({ id: InvoiceId })
            .meta({ param: { name: 'id', in: 'path' } }),
        },
        responses: {
          '204': { description: 'No content' },
          '404': { description: 'Invoice not found' },
        },
      },
    },
  },
});

if (process.env.NODE_ENV === 'test') {
  describe('OpenAPI Spec', () => {
    it('should export valid openapi spec', () => {
      expect(openapiSpec).toBeDefined();
    });
  });
}