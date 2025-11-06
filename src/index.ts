/**
 * src/index.ts
 *
 * Main Express application entry point. Configures middleware, routes, and error handling.
 * Includes graceful shutdown handlers for clean database disconnection.
 */

import express, { type Request, type Response, type NextFunction } from 'express';
import pinoHttp from 'pino-http';
import { logServerEvent, logError } from './utils/logger';

/**
 * Validate required environment variables before starting the server.
 * Ensures DATABASE_URL and JWT_SECRET are present; exits if any are missing.
 */
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missing = requiredEnvVars.filter(v => !process.env[v]);
if (missing.length > 0) {
  logError(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';
import invoiceRouter from './routes/invoice.routes';
import taxProfileRouter from './routes/taxProfile.routes';
import { prisma } from './prisma';


import swaggerUi from 'swagger-ui-express';
import { openapiSpec } from './openapi/spec';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { sendSuccess, sendError } from './utils/responses';

const app = express();

/**
 * MIDDLEWARE: Request ID Tracing
 *
 * Generates or uses existing request ID for tracking and debugging.
 * Attaches to both request and response headers for correlation.
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  req.id = req.headers['x-request-id'] as string || Date.now().toString();
  res.setHeader('X-Request-ID', req.id);
  next();
});

/**
 * MIDDLEWARE: Rate Limiting
 *
 * Protects API from abuse with per-IP limits.
 * Window: 15 minutes, Limit: 100 requests per IP
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * MIDDLEWARE: OpenAPI Documentation
 *
 * Serves Swagger UI at /api-docs with OpenAPI 3.0 specification.
 */

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(openapiSpec, {
    swaggerOptions: {
      docExpansion: 'none',
      defaultModelsExpandDepth: -1,
    },
  })
);

/**
 * MIDDLEWARE: CORS (Cross-Origin Resource Sharing)
 *
 * Configures CORS policy based on environment.
 * Production: Restricted to FRONTEND_URL
 * Development: Allows all origins
 */
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(cookieParser());
app.use(express.json());

/**
 * MIDDLEWARE: Structured Request/Response Logging
 *
 * Uses Pino for production-grade structured logging.
 * Development: Pretty-printed output with colors
 * Production: JSON format for log aggregation
 */
const pinoMiddlewareOptions = {
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  timestamp: (require('pino')).stdTimeFunctions.isoTime,
} as any;

if (process.env.NODE_ENV !== 'production') {
  pinoMiddlewareOptions.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      singleLine: false,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  };
}

const pinoMiddleware = pinoHttp(pinoMiddlewareOptions);
app.use(pinoMiddleware);

/**
 * Apply rate limiting to all API routes
 */
app.use('/api/', limiter);

/**
 * ROUTES: API Endpoints
 *
 * All routes are prefixed with /api/ and rate-limited.
 */
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/invoices', invoiceRouter);
app.use('/api/taxProfiles', taxProfileRouter);

/**
 * ROUTES: Health Checks
 */
app.get('/', (req: Request, res: Response) => {
  return sendSuccess(res, {
    status: 'ok',
    service: 'Invoice Management API',
    version: '1.0.0',
    docs: '/api-docs',
  }, 200, req);
});

app.get('/health', (req: Request, res: Response) => {
  return sendSuccess(res, { status: 'healthy', timestamp: new Date().toISOString() }, 200, req);
});

/**
 * MIDDLEWARE: Global Error Handler
 *
 * Catches all unhandled errors from controllers and middleware.
 * Logs full error context and returns standardized error response with unique errorId.
 */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const errorId = Date.now().toString();

  logError('Unhandled request error', err, {
    errorId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: (req as any).user?.sub,
  });

  const statusCode = err.status || err.statusCode || 500;

  return sendError(res, 'Internal server error', statusCode, req, { errorId });
});

/**
 * MIDDLEWARE: 404 Handler
 *
 * Catches all requests to undefined routes.
 * Must be registered last to catch everything else.
 */
app.use((req: Request, res: Response) => {
  return sendError(res, 'Not found', 404, req);
});

/**
 * SERVER: Start Listening
 */
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const server = app.listen(PORT, () => {
  logServerEvent(`Server listening on http://localhost:${PORT}`, {
    port: PORT,
    docsUrl: `http://localhost:${PORT}/api-docs`,
  });
});

/**
 * SHUTDOWN HANDLERS: Graceful Termination
 *
 * Ensures clean shutdown with proper resource cleanup.
 * Closes HTTP server and database connections before exiting.
 * Timeout: 10 seconds before forced shutdown.
 */

// Handle SIGTERM (from container orchestration: Docker, Kubernetes, etc.)
process.on('SIGTERM', async () => {
  logServerEvent('SIGTERM received, initiating graceful shutdown');

  server.close(async () => {
    logServerEvent('HTTP server closed');

    try {
      await prisma.$disconnect();
      logServerEvent('Database connection closed');
    } catch (err) {
      logError('Error disconnecting database during shutdown', err as Error);
    }

    logServerEvent('Graceful shutdown complete');
    process.exit(0);
  });

  // Force shutdown if timeout exceeded
  setTimeout(() => {
    logError('Forced shutdown after 10s timeout');
    process.exit(1);
  }, 10000);
});

// Handle SIGINT (Ctrl+C from terminal)
process.on('SIGINT', async () => {
  logServerEvent('SIGINT received, initiating graceful shutdown');

  server.close(async () => {
    logServerEvent('HTTP server closed');

    try {
      await prisma.$disconnect();
      logServerEvent('Database connection closed');
    } catch (err) {
      logError('Error disconnecting database during shutdown', err as Error);
    }

    logServerEvent('Graceful shutdown complete');
    process.exit(0);
  });

  // Force shutdown if timeout exceeded
  setTimeout(() => {
    logError('Forced shutdown after 10s timeout');
    process.exit(1);
  }, 10000);
});

// Handle unhandled Promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled Rejection', new Error(String(reason)), { promise: String(promise) });
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logError('Uncaught Exception', err);
  process.exit(1);
});