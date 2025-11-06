import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

export const prisma = new PrismaClient();

export async function setupTestDatabase() {
  // Run migrations (or generate schema) against the temporary DB
  execSync('npx prisma migrate deploy', { stdio: 'ignore' });

  // Ensure Prisma client points to the new DB
  await prisma.$connect();
}

// Clean up after each test file
export async function teardownTestDatabase() {
  await prisma.$disconnect();
}
