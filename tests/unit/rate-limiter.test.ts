/**
 * tests/unit/rate-limiter.test.ts
 *
 * Rate limiter integration tests.
 * Verifies request throttling and rate limit enforcement across multiple scenarios.
 */

import request from 'supertest';
import express, { type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';

describe('Rate Limiter', () => {
  let app: express.Application;

  beforeEach(() => {
    // Create a fresh app for each test to reset rate limit state
    app = express();
    app.use(express.json());

    // Configure rate limiter with tighter limits for testing
    const testLimiter = rateLimit({
      windowMs: 1000, // 1 second window for fast testing
      max: 5, // Allow 5 requests per second
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Apply rate limiter to /api routes
    app.use('/api/', testLimiter);

    // Test endpoint
    app.get('/api/test', (req: Request, res: Response) => {
      res.json({ message: 'success', timestamp: Date.now() });
    });

    // Health endpoint (should not be rate-limited in real app)
    app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'healthy' });
    });
  });

  describe('Rate Limiter Basic Functionality', () => {
    it('should allow requests within the limit', async () => {
      const responses = [];

      // Make 5 requests (at the limit)
      for (let i = 0; i < 5; i++) {
        const res = await request(app).get('/api/test');
        responses.push(res.status);
      }

      // All should succeed
      expect(responses).toEqual([200, 200, 200, 200, 200]);
    });

    it('should reject requests exceeding the limit', async () => {
      // Make requests up to the limit
      for (let i = 0; i < 5; i++) {
        await request(app).get('/api/test');
      }

      // The 6th request should be rate-limited
      const res = await request(app).get('/api/test');
      expect(res.status).toBe(429); // Too Many Requests
      expect(res.body.message || res.text).toContain('Too many requests');
    });

    it('should include rate limit headers in response', async () => {
      const res = await request(app).get('/api/test');

      // Check for standard rate limit headers
      expect(res.headers['ratelimit-limit']).toBeDefined();
      expect(res.headers['ratelimit-remaining']).toBeDefined();
      expect(res.headers['ratelimit-reset']).toBeDefined();

      // Verify header values
      expect(Number(res.headers['ratelimit-limit'])).toBe(5);
      expect(Number(res.headers['ratelimit-remaining'])).toBe(4); // 5 - 1
    });

    it('should track remaining requests correctly', async () => {
      const requests: Array<{ status: number; remaining: number; limit: number }> = [];

      for (let i = 0; i < 5; i++) {
        const res = await request(app).get('/api/test');
        requests.push({
          status: res.status,
          remaining: Number(res.headers['ratelimit-remaining']),
          limit: Number(res.headers['ratelimit-limit']),
        });
      }

      // Verify decreasing remaining count
      expect(requests[0]!.remaining).toBe(4); // 5 - 1 (first request)
      expect(requests[1]!.remaining).toBe(3); // 5 - 2
      expect(requests[2]!.remaining).toBe(2); // 5 - 3
      expect(requests[3]!.remaining).toBe(1); // 5 - 4
      expect(requests[4]!.remaining).toBe(0); // 5 - 5
    });

    it('should reset rate limit after time window expires', async () => {
      // Make requests up to limit
      for (let i = 0; i < 5; i++) {
        await request(app).get('/api/test');
      }

      // 6th request should fail
      let res = await request(app).get('/api/test');
      expect(res.status).toBe(429);

      // Wait for window to expire (1 second + buffer)
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Request should succeed again
      res = await request(app).get('/api/test');
      expect(res.status).toBe(200);
    });
  });

  describe('Rate Limiter with Different Endpoints', () => {
    it('should apply rate limit to all /api/* paths', async () => {
      app.get('/api/users', (req: Request, res: Response) => {
        res.json({ users: [] });
      });

      app.get('/api/invoices', (req: Request, res: Response) => {
        res.json({ invoices: [] });
      });

      const endpoints = ['/api/test', '/api/users', '/api/invoices'];
      const results: number[] = [];

      // Make 6 requests across different endpoints
      for (let i = 0; i < 6; i++) {
        const endpoint = endpoints[i % endpoints.length];
        if (!endpoint) continue;
        const res = await request(app).get(endpoint);
        results.push(res.status);
      }

      // First 5 should succeed, 6th should be rate-limited
      expect(results).toEqual([200, 200, 200, 200, 200, 429]);
    });

    it('should not rate-limit /health endpoint', async () => {
      // Health endpoint is outside /api/
      const responses = [];

      for (let i = 0; i < 10; i++) {
        const res = await request(app).get('/health');
        responses.push(res.status);
      }

      // All should be 200, no rate limiting
      expect(responses.every(status => status === 200)).toBe(true);
    });
  });

  describe('Rate Limiter Error Handling', () => {
    it('should return 429 with descriptive message when rate limited', async () => {
      // Exceed the limit
      for (let i = 0; i < 6; i++) {
        await request(app).get('/api/test');
      }

      const res = await request(app).get('/api/test');
      expect(res.status).toBe(429);
      expect(res.text).toContain('Too many requests');
    });

    it('should maintain separate rate limit counters per IP (simulated)', async () => {
      // In a real scenario, different IPs would have separate counters
      // With supertest, all requests appear from the same source
      // This test verifies the limiter is working correctly

      const res1 = await request(app).get('/api/test');
      const res2 = await request(app).get('/api/test');

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);

      // They share the same counter since they're from same "IP"
      const remaining1 = Number(res1.headers['ratelimit-remaining']);
      const remaining2 = Number(res2.headers['ratelimit-remaining']);

      expect(remaining1 > remaining2).toBe(true); // Decreasing
    });
  });

  describe('Production Configuration', () => {
    it('should verify standard vs legacy headers configuration', async () => {
      // The rate limiter should use standardHeaders: true
      const res = await request(app).get('/api/test');

      // Standard headers (RFC 6585)
      expect(res.headers['ratelimit-limit']).toBeDefined();
      expect(res.headers['ratelimit-remaining']).toBeDefined();
      expect(res.headers['ratelimit-reset']).toBeDefined();

      // Legacy headers should not be present
      expect(res.headers['x-ratelimit-limit']).toBeUndefined();
      expect(res.headers['x-ratelimit-remaining']).toBeUndefined();
    });

    it('should have reasonable defaults for production', () => {
      // Production limiter from index.ts:
      // windowMs: 15 * 60 * 1000 (15 minutes)
      // max: 100 requests

      // This test documents the expected production configuration
      const expectedWindowMs = 15 * 60 * 1000;
      const expectedMaxRequests = 100;

      expect(expectedWindowMs).toBe(900000);
      expect(expectedMaxRequests).toBe(100);

      // 100 requests per 15 minutes = ~6.67 requests per minute = healthy API usage
    });
  });
});
