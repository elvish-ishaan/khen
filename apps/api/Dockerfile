# Dockerfile for API Backend (Express.js)
# Multi-stage build for smaller production image

# Stage 1: Base image with pnpm
FROM node:22-alpine AS base
RUN npm install -g pnpm@10.17.1
WORKDIR /app

# Stage 2: Install dependencies
FROM base AS dependencies

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy all package.json files for workspace resolution
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/

# Install dependencies (including workspace packages)
RUN pnpm install --frozen-lockfile

# Stage 3: Build application
FROM dependencies AS builder

# Copy source code
COPY apps/api ./apps/api
COPY packages/db ./packages/db
COPY packages/typescript-config ./packages/typescript-config
COPY packages/eslint-config ./packages/eslint-config

# Generate Prisma Client
RUN pnpm --filter @repo/db prisma generate

# Build the API application
RUN pnpm --filter api build

# Stage 4: Production image
FROM node:22-alpine AS production

WORKDIR /app

# Install pnpm for production
RUN npm install -g pnpm@10.17.1

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json files
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy Prisma schema and generate client
COPY packages/db/prisma ./packages/db/prisma
RUN pnpm --filter @repo/db prisma generate

# Copy built application from builder stage
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run the application
CMD ["node", "apps/api/dist/index.js"]
