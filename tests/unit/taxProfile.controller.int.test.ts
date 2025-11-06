/**
 * tests/unit/taxProfile.controller.int.test.ts
 *
 * Integration tests for tax profile management routes.
 * Tests tax profile CRUD with tax ID numbers and addresses.
 */

import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from '../../src/routes/auth.routes';
import taxProfileRouter from '../../src/routes/taxProfile.routes';
import { prisma } from '../../src/prisma';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRouter);
app.use('/taxProfiles', taxProfileRouter);

function getAuthCookie(res: request.Response) {
  const setCookie = res.headers['set-cookie'];
  if (!setCookie || !setCookie[0]) return '';
  return setCookie[0]?.split(';')[0] ?? '';
}

describe('TaxProfile controller - integration', () => {
  let authCookie = '';
  let createdId: number | undefined;
  const userPayload = {
    email: `taxprofile-test-${Date.now()}@taxprofile.com`,
    password: 'SuperSecret123!',
    name: 'Tax Profile User',
  };
  const validProfile = {
    userId: 0,
    name: 'Primary Business',
    tax_id_number: 'US12-3456789',
    address: '123 Business Street, New York, NY 10001, USA'
  };

  beforeAll(async () => {
    await prisma.taxProfile.deleteMany();
    await prisma.user.deleteMany();
    // Register and login user
    const regRes = await request(app).post('/auth/register').send(userPayload);
    expect(regRes.status).toBe(201);
    authCookie = getAuthCookie(regRes);
    const dbUser = await prisma.user.findUnique({ where: { email: userPayload.email } });
    expect(dbUser).toBeTruthy();
    validProfile.userId = dbUser!.id;
  });

  afterAll(async () => {
    await prisma.taxProfile.deleteMany();
    await prisma.user.deleteMany({
      where: { email: { endsWith: '@taxprofile.com' } }
    });
    await prisma.$disconnect();
  });

  it('POST /taxProfiles - creates a tax profile', async () => {
    const res = await request(app)
      .post('/taxProfiles')
      .set('Cookie', authCookie)
      .send(validProfile);
    if (res.status !== 201) {
      console.log('Error response:', res.body);
    }
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        userId: validProfile.userId,
        name: validProfile.name,
        tax_id_number: validProfile.tax_id_number,
        address: validProfile.address,
      },
      timestamp: expect.any(String),
    });
    createdId = res.body.data.id;
  });

  it('GET /taxProfiles/:id - returns the tax profile', async () => {
    const res = await request(app)
      .get(`/taxProfiles/${createdId}`)
      .set('Cookie', authCookie);
    if (res.status !== 200) {
      console.log('Error response:', res.body);
    }
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        userId: validProfile.userId,
        name: validProfile.name,
        tax_id_number: validProfile.tax_id_number,
        address: validProfile.address,
      },
      timestamp: expect.any(String),
    });
  });

  it('PATCH /taxProfiles/:id - updates the tax profile', async () => {
    const newName = 'Primary Business Updated';
    const res = await request(app)
      .patch(`/taxProfiles/${createdId}`)
      .set('Cookie', authCookie)
      .send({ name: newName });
    if (res.status !== 200) {
      console.log('Error response:', res.body);
    }
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        name: newName,
      },
      timestamp: expect.any(String),
    });
  });

  it('GET /taxProfiles - returns paginated list', async () => {
    const res = await request(app)
      .get('/taxProfiles?page=1&limit=5&name=Primary')
      .set('Cookie', authCookie);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        page: 1,
        limit: 5,
        total: expect.any(Number),
        data: expect.any(Array),
      },
      timestamp: expect.any(String),
    });
    // Verify at least one item matches the filter
    expect(res.body.data.data.length).toBeGreaterThan(0);
    expect(res.body.data.data[0].name).toContain('Primary');
  });

  it('DELETE /taxProfiles/:id - deletes the tax profile', async () => {
    const res = await request(app)
      .delete(`/taxProfiles/${createdId}`)
      .set('Cookie', authCookie);
    if (res.status !== 204) {
      console.log('Error response:', res.body);
    }
    expect(res.status).toBe(204);
  });

  it('GET /taxProfiles/:id - returns 404 after deletion', async () => {
    const res = await request(app)
      .get(`/taxProfiles/${createdId}`)
      .set('Cookie', authCookie);
    if (res.status !== 404) {
      console.log('Error response:', res.body);
    }
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      success: false,
      error: 'Not found',
      timestamp: expect.any(String),
    });
  });
});