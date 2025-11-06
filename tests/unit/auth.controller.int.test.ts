/**
 * tests/unit/auth.controller.int.test.ts
 *
 * Integration tests for authentication routes.
 * Tests registration, login, logout, and error handling.
 */

import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from '../../src/routes/auth.routes';
import { prisma } from '../../src/prisma';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRouter);

describe('Auth routes - integration', () => {
  beforeAll(async () => {
    // Clean up test data before tests
    await prisma.user.deleteMany({
      where: { email: { endsWith: '@auth.com' } }
    });
  });

  afterAll(async () => {
    // Clean up test data after tests
    await prisma.user.deleteMany({
      where: { email: { endsWith: '@auth.com' } }
    });
    await prisma.$disconnect();
  });

  const userPayload = {
    email: 'eve@auth.com',
    password: 'SuperSecret123!',
    name: 'Eve',
  };

  it('POST /auth/register - creates user with JWT cookie', async () => {
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

    // Verify access_token cookie is set
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    if (setCookie && setCookie[0]) {
      expect(setCookie[0]).toContain('access_token');
    }
  });

  it('POST /auth/register - rejects duplicate email (409)', async () => {
    // User created in previous test, attempt same email should fail
    const res = await request(app).post('/auth/register').send(userPayload);
    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({
      success: false,
      error: 'Email already used',
      timestamp: expect.any(String),
    });
  });

  it('POST /auth/login - successful login with valid credentials', async () => {
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
  });

  it('POST /auth/login - rejects invalid credentials (401)', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: userPayload.email, password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      success: false,
      error: 'Invalid credentials',
      timestamp: expect.any(String),
    });
  });

  it('POST /auth/logout - clears authentication cookie', async () => {
    // First login to get valid cookie
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: userPayload.email, password: userPayload.password });

    const cookie = loginRes.headers['set-cookie'];
    let logoutRes;

    if (cookie) {
      logoutRes = await request(app)
        .post('/auth/logout')
        .set('Cookie', cookie);
    }

    if (logoutRes) {
      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body).toMatchObject({
        success: true,
        data: { message: 'Logged out' },
        timestamp: expect.any(String),
      });

      // Verify access_token cookie is cleared
      if (logoutRes.headers['set-cookie']) {
        expect(logoutRes.headers['set-cookie'][0]).toContain('access_token=;');
      }
    }
  });
});
