/**
 * tests/unit/invoice.controller.int.test.ts
 *
 * Integration tests for invoice management routes.
 * Tests invoice CRUD with decimal precision and status lifecycle.
 */

import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from '../../src/routes/auth.routes';
import invoiceRouter from '../../src/routes/invoice.routes';
import { prisma } from '../../src/prisma';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use('/api/invoices', invoiceRouter);

function getAuthCookie(res: request.Response) {
  const setCookie = res.headers['set-cookie'];
  if (!setCookie || !setCookie[0]) return '';
  return setCookie[0]?.split(';')[0] ?? '';
}

describe('Invoice controller - integration', () => {
  let authCookie = '';
  let createdId: number;
  let taxProfileId: number;
  const testId = Date.now();
  
  const userPayload = {
    email: `invoice-test-${testId}@test.com`,
    password: 'SuperSecret123!',
    name: 'Invoice Test User',
  };

  const taxProfilePayload = {
    name: 'Test Profile',
    tax_id_number: 'US12-3456789',
    address: '123 Test Street, New York, NY 10001, USA',
  };

  const validInvoice = {
    taxProfileId: 0,
    amount: '100.55',
    status: 'draft',
  };

  beforeAll(async () => {
    // Only clean up our test data
    const user = await prisma.user.findUnique({ where: { email: userPayload.email } });
    if (user) {
      await prisma.invoice.deleteMany({ where: { taxProfile: { userId: user.id } } });
      await prisma.taxProfile.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }

    // Create user and get auth cookie
    const regRes = await request(app)
      .post('/api/auth/register')
      .send(userPayload);
    expect(regRes.status).toBe(201);
    authCookie = getAuthCookie(regRes);
    expect(authCookie).toBeTruthy();

    // Create tax profile for the user
    const newUser = await prisma.user.findUnique({ where: { email: userPayload.email } });
    expect(newUser).toBeTruthy();
    const taxProfile = await prisma.taxProfile.create({
      data: {
        ...taxProfilePayload,
        userId: newUser!.id,
      },
    });
    taxProfileId = taxProfile.id;
    validInvoice.taxProfileId = taxProfileId;
  });

  afterAll(async () => {
    // Only clean up our test data
    const user = await prisma.user.findUnique({ where: { email: userPayload.email } });
    if (user) {
      await prisma.invoice.deleteMany({ where: { taxProfile: { userId: user.id } } });
      await prisma.taxProfile.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
    await prisma.$disconnect();
  });

  it('POST /invoices - creates an invoice', async () => {
    const res = await request(app)
      .post('/api/invoices')
      .set('Cookie', authCookie)
      .send(validInvoice);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        taxProfileId: validInvoice.taxProfileId,
        status: validInvoice.status,
        amount: expect.any(String),
      },
      timestamp: expect.any(String),
    });
    createdId = res.body.data.id;
  });

  it('GET /api/invoices/:id - returns the invoice', async () => {
    const res = await request(app)
      .get(`/api/invoices/${createdId}`)
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        id: createdId,
        taxProfileId: validInvoice.taxProfileId,
        status: validInvoice.status,
        amount: expect.any(String),
      },
      timestamp: expect.any(String),
    });
  });

  it('PATCH /api/invoices/:id - updates the invoice', async () => {
    const updates = {
      status: 'sent',
      amount: '150.75',
    };

    const res = await request(app)
      .patch(`/api/invoices/${createdId}`)
      .set('Cookie', authCookie)
      .send(updates);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        id: createdId,
        taxProfileId: validInvoice.taxProfileId,
        status: updates.status,
        amount: updates.amount,
      },
      timestamp: expect.any(String),
    });
  });

  it('GET /api/invoices - returns paginated list with filters', async () => {
    const res = await request(app)
      .get('/api/invoices?page=1&limit=5&status=sent&minAmount=100')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        page: 1,
        limit: 5,
        data: expect.arrayContaining([
          expect.objectContaining({
            status: 'sent',
            amount: expect.any(String),
          }),
        ]),
      },
      timestamp: expect.any(String),
    });
  });

  it('DELETE /api/invoices/:id - deletes the invoice', async () => {
    const res = await request(app)
      .delete(`/api/invoices/${createdId}`)
      .set('Cookie', authCookie);

    expect(res.status).toBe(204);
  });

  it('GET /api/invoices/:id - returns 404 after deletion', async () => {
    const res = await request(app)
      .get(`/api/invoices/${createdId}`)
      .set('Cookie', authCookie);

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      success: false,
      error: 'Not found',
      timestamp: expect.any(String),
    });
  });
});