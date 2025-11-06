
# Builder stage 
# Compile TypeScript + generate Prisma client

FROM node:20 AS builder
WORKDIR /app

# Install dependencies (dev + prod)
COPY package*.json ./
RUN npm ci

# Copy Prisma schema first (needed for generation)
COPY prisma ./prisma

# Copy the rest of the source code
COPY . .

# Provide a placeholder DATABASE_URL for the generator
# This value is not used at runtime, it only satisfies the generator.
ARG DATABASE_URL=postgresql://user:pass@localhost:5432/dummydb
ENV DATABASE_URL=${DATABASE_URL}

# Generate the Prisma client
RUN npx prisma generate

# Compile TypeScript (assumes "build": "tsc" in package.json)
RUN npm run build

# Runtime stage 
# Minimal image for production

FROM node:20-alpine AS runtime
WORKDIR /app

# Install only production dependencies
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Copy the generated Prisma client
COPY --from=builder /app/node_modules ./node_modules

# Add the Prisma schema (needed for migrations in tests)
COPY prisma ./prisma

EXPOSE 3000
CMD ["node", "dist/src/index.js"]