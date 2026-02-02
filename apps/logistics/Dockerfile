# Dockerfile for Logistics App (Next.js)
# Multi-stage build for optimized production image

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
COPY apps/logistics/package.json ./apps/logistics/
COPY packages/db/package.json ./packages/db/
COPY packages/ui/package.json ./packages/ui/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/

# Install dependencies (including workspace packages)
RUN pnpm install --frozen-lockfile

# Stage 3: Build application
FROM dependencies AS builder

# Copy source code
COPY apps/logistics ./apps/logistics
COPY packages/db ./packages/db
COPY packages/ui ./packages/ui
COPY packages/typescript-config ./packages/typescript-config
COPY packages/eslint-config ./packages/eslint-config

# Generate Prisma Client (needed for type definitions)
RUN pnpm --filter @repo/db prisma generate

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application
RUN pnpm --filter logistics build

# Stage 4: Production image
FROM node:22-alpine AS production

WORKDIR /app

# Install pnpm for production
RUN npm install -g pnpm@10.17.1

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json files
COPY apps/logistics/package.json ./apps/logistics/
COPY packages/db/package.json ./packages/db/
COPY packages/ui/package.json ./packages/ui/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy Prisma schema and generate client
COPY packages/db/prisma ./packages/db/prisma
RUN pnpm --filter @repo/db prisma generate

# Copy built Next.js application from builder stage
COPY --from=builder /app/apps/logistics/.next ./apps/logistics/.next
COPY --from=builder /app/apps/logistics/public ./apps/logistics/public
COPY --from=builder /app/apps/logistics/next.config.ts ./apps/logistics/

# Copy UI package build if needed
COPY --from=builder /app/packages/ui/dist ./packages/ui/dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3002
ENV NEXT_TELEMETRY_DISABLED=1

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run the application
CMD ["pnpm", "--filter", "logistics", "start"]
