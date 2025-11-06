/**
 * tests/unit/user.controller.int.test.ts
 *
 * Integration tests for user management routes.
 * Tests CRUD operations with authentication and authorization.
 */

import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from '../../src/routes/auth.routes';
import userRouter from '../../src/routes/user.routes';   
import { prisma } from '../../src/prisma';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRouter);
app.use('/users', userRouter);   // mount the user router

/*** Helper to extract the JWT cookie ***/
function getAuthCookie(res: request.Response) {
  const setCookie = res.headers['set-cookie'];
  if (!setCookie || !setCookie[0]) return '';
  return setCookie[0]?.split(';')[0] ?? '';
}

/*** Test data ***/
const testId = Date.now();
const userPayload = {
  email: `alice-user-${testId}@test.com`,
  password: 'SuperSecret123!',
  name: 'Alice',
};

describe('User controller - integration', () => {
  let authCookie = '';
  let createdUserId: number;

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: `user-${testId}` } }
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: `user-${testId}` } }
    });
    await prisma.$disconnect();
  });

  it('POST /auth/register - creates a user', async () => {
    const res = await request(app).post('/auth/register').send(userPayload);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        token: expect.any(String),
        user: { email: userPayload.email, name: userPayload.name },
      },
      timestamp: expect.any(String),
    });
    authCookie = getAuthCookie(res);
    expect(authCookie).toContain('access_token=');
  });

  it('POST /auth/login - returns JWT cookie', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: userPayload.email, password: userPayload.password });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        token: expect.any(String),
      },
      timestamp: expect.any(String),
    });
    authCookie = getAuthCookie(res);
    expect(authCookie).toContain('access_token=');
  });

  it('GET /users/:id - returns the user data', async () => {
    // the user created by register has the same email, fetch its id via Prisma
    const dbUser = await prisma.user.findUnique({ where: { email: userPayload.email } });
    expect(dbUser).toBeTruthy();
    createdUserId = dbUser!.id;

    const res = await request(app)
      .get(`/users/${createdUserId}`)
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        id: createdUserId,
        email: userPayload.email,
        name: userPayload.name,
      },
      timestamp: expect.any(String),
    });
  });

  it('PATCH /users/:id - updates the user', async () => {
    const newName = 'Alice Updated';
    const res = await request(app)
      .patch(`/users/${createdUserId}`)
      .set('Cookie', authCookie)
      .send({ name: newName });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        id: createdUserId,
        name: newName,
      },
      timestamp: expect.any(String),
    });
  });

  it('GET /users - returns paginated list', async () => {
    const res = await request(app)
      .get('/users?page=1&limit=5&email=alice')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        page: 1,
        limit: 5,
        data: expect.arrayContaining([
          expect.objectContaining({ name: expect.stringContaining('Alice') })
        ]),
      },
      timestamp: expect.any(String),
    });
  });

  it('DELETE /users/:id - deletes the user', async () => {
    const res = await request(app)
      .delete(`/users/${createdUserId}`)
      .set('Cookie', authCookie);

    expect(res.status).toBe(204);
  });

  it('GET /users/:id - returns 404 after deletion', async () => {
    const res = await request(app)
      .get(`/users/${createdUserId}`)
      .set('Cookie', authCookie);

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      success: false,
      error: 'Not found',
      timestamp: expect.any(String),
    });
  });
});
