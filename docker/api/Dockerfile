# Stage 1: Base - Setup pnpm
FROM node:alpine AS base
RUN npm install -g pnpm

# Stage 2: Dependencies - Install all dependencies (including devDependencies)
FROM base AS deps
WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy package.json files for workspace resolution
COPY packages/db/package.json ./packages/db/
COPY apps/api/package.json ./apps/api/

# Install all dependencies (needed for build)
RUN pnpm install --frozen-lockfile

# Stage 3: Builder - Build the application
FROM base AS builder
WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy all source code
COPY packages ./packages
COPY apps/api ./apps/api

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

# Generate Prisma Client
RUN pnpm --filter @repo/db exec prisma generate

# Build the application
RUN pnpm turbo run build --filter=api...

# Stage 4: Production - Minimal runtime image
FROM node:alpine AS production
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy package.json files
COPY packages/db/package.json ./packages/db/
COPY apps/api/package.json ./apps/api/

# Install ONLY production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy Prisma schema and generate client (needed at runtime)
COPY packages/db/prisma ./packages/db/prisma
RUN pnpm --filter @repo/db exec prisma generate

# Copy built application from builder stage
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run application
CMD ["node", "apps/api/dist/index.js"]