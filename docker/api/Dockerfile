FROM node:alpine

RUN npm install -g pnpm

WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

COPY ./packages ./packages
COPY apps/api/ ./apps/api/

# Install all dependencies (needed for build)
RUN pnpm install

# Generate Prisma Client
RUN pnpm --filter @repo/db exec prisma generate

# Build the application
RUN pnpm turbo run build --filter=api...

# Expose port
EXPOSE 4000

# Run application
CMD ["node", "apps/api/dist/index.js"]