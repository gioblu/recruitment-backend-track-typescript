import * as dotenv from 'dotenv';
import { prisma } from '../src/prisma';

dotenv.config({ path: '.env.test' });

/**
 * Wait for database to be ready with exponential backoff
 * This prevents test failures when database is still initializing
 */
async function waitForDb(retries = 30, delayMs = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database is ready');
      return;
    } catch (err) {
      console.log(`⏳ Waiting for DB... (attempt ${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  throw new Error('Database failed to become ready after 30 attempts');
}

beforeAll(async () => {
  await waitForDb();
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});