# Docker Deployment Guide

This guide explains how to build and deploy the Khen Food Delivery Platform using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 2GB of free disk space

## Quick Start

### Development with Docker

Use the existing `docker-compose.yml` for development (PostgreSQL only):

```bash
# Start PostgreSQL for development
docker-compose up -d
```

### Production Deployment

1. **Copy and configure environment variables:**

```bash
cp .env.production.example .env.production
```

Edit `.env.production` and fill in all required values:
- Database credentials
- JWT secret (minimum 32 characters)
- MSG91 API keys
- Razorpay API keys
- Google Cloud Storage credentials
- Google Maps API key

2. **Build and start all services:**

```bash
docker-compose -f docker-compose.production.yml up -d
```

This will start:
- PostgreSQL database (port 5432)
- API backend (port 4000)
- User frontend (port 3000)
- Restaurant frontend (port 3001)
- Logistics frontend (port 3002)

3. **Run database migrations:**

```bash
# Run migrations on the API container
docker exec khen-api pnpm --filter @repo/db prisma migrate deploy
```

4. **Check service health:**

```bash
# View all running containers
docker-compose -f docker-compose.production.yml ps

# Check API logs
docker logs khen-api

# Check User app logs
docker logs khen-user

# Check Restaurant app logs
docker logs khen-restaurant

# Check Logistics app logs
docker logs khen-logistics

# Check Database logs
docker logs khen-postgres
```

## Building Individual Services

### Build API Backend

```bash
docker build -f apps/api/Dockerfile -t khen-api:latest .
```

### Build User Frontend

```bash
docker build -f apps/user/Dockerfile -t khen-user:latest .
```

### Build Restaurant Frontend

```bash
docker build -f apps/restaurant/Dockerfile -t khen-restaurant:latest .
```

### Build Logistics Frontend

```bash
docker build -f apps/logistics/Dockerfile -t khen-logistics:latest .
```

## Running Individual Containers

### API Backend

```bash
docker run -d \
  --name khen-api \
  -p 4000:4000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="your_secret" \
  -e NODE_ENV="production" \
  khen-api:latest
```

### User Frontend

```bash
docker run -d \
  --name khen-user \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="http://localhost:4000" \
  -e NODE_ENV="production" \
  khen-user:latest
```

### Restaurant Frontend

```bash
docker run -d \
  --name khen-restaurant \
  -p 3001:3001 \
  -e NEXT_PUBLIC_API_URL="http://localhost:4000" \
  -e NODE_ENV="production" \
  khen-restaurant:latest
```

### Logistics Frontend

```bash
docker run -d \
  --name khen-logistics \
  -p 3002:3002 \
  -e NEXT_PUBLIC_API_URL="http://localhost:4000" \
  -e NODE_ENV="production" \
  khen-logistics:latest
```

## Docker Compose Commands

### Start services

```bash
docker-compose -f docker-compose.production.yml up -d
```

### Stop services

```bash
docker-compose -f docker-compose.production.yml down
```

### Stop services and remove volumes (⚠️ destroys database data)

```bash
docker-compose -f docker-compose.production.yml down -v
```

### View logs

```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f api
```

### Restart services

```bash
# Restart all
docker-compose -f docker-compose.production.yml restart

# Restart specific service
docker-compose -f docker-compose.production.yml restart api
```

## Database Management

### Run Prisma migrations

```bash
docker exec khen-api pnpm --filter @repo/db prisma migrate deploy
```

### Access Prisma Studio (database GUI)

```bash
docker exec -it khen-api pnpm --filter @repo/db prisma studio
```

### Backup database

```bash
docker exec khen-postgres pg_dump -U khen khen_db > backup.sql
```

### Restore database

```bash
cat backup.sql | docker exec -i khen-postgres psql -U khen khen_db
```

## Health Checks

All services include health checks:

- **API**: `GET http://localhost:4000/health`
- **User**: `GET http://localhost:3000/`
- **Restaurant**: `GET http://localhost:3001/`
- **Logistics**: `GET http://localhost:3002/`
- **PostgreSQL**: `pg_isready` command

Check health status:

```bash
docker inspect --format='{{.State.Health.Status}}' khen-api
docker inspect --format='{{.State.Health.Status}}' khen-user
docker inspect --format='{{.State.Health.Status}}' khen-restaurant
docker inspect --format='{{.State.Health.Status}}' khen-logistics
docker inspect --format='{{.State.Health.Status}}' khen-postgres
```

## Monitoring

### View resource usage

```bash
docker stats khen-api khen-user khen-restaurant khen-logistics khen-postgres
```

### View container details

```bash
docker inspect khen-api
```

## Troubleshooting

### Container won't start

```bash
# Check logs for errors
docker logs khen-api --tail 100

# Check container status
docker ps -a
```

### Database connection issues

```bash
# Verify database is healthy
docker inspect --format='{{.State.Health.Status}}' khen-postgres

# Check database logs
docker logs khen-postgres

# Test connection manually
docker exec -it khen-postgres psql -U khen -d khen_db
```

### Build failures

```bash
# Clear Docker build cache
docker builder prune

# Rebuild without cache
docker-compose -f docker-compose.production.yml build --no-cache
```

### Port conflicts

If ports are already in use, modify the port mappings in `.env.production`:

```env
API_PORT=4001
USER_PORT=3003
RESTAURANT_PORT=3004
LOGISTICS_PORT=3005
DB_PORT=5433
```

## Production Best Practices

1. **Security:**
   - Never commit `.env.production` to version control
   - Use strong, unique passwords for database
   - Use a secure JWT secret (minimum 32 characters)
   - Keep API keys and credentials secret

2. **Performance:**
   - Set appropriate resource limits in production
   - Use a reverse proxy (Nginx/Traefik) in front of services
   - Enable SSL/TLS for production domains

3. **Monitoring:**
   - Set up log aggregation (ELK Stack, Grafana Loki)
   - Monitor container health and resource usage
   - Set up alerts for service failures

4. **Backups:**
   - Schedule regular database backups
   - Test backup restoration regularly
   - Store backups in a secure location

## Scaling

To run multiple instances of the API:

```bash
docker-compose -f docker-compose.production.yml up -d --scale api=3
```

Note: You'll need a load balancer (Nginx, HAProxy) to distribute traffic.

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build API Image
        run: docker build -f apps/api/Dockerfile -t khen-api:${{ github.sha }} .

      - name: Build User Image
        run: docker build -f apps/user/Dockerfile -t khen-user:${{ github.sha }} .

      - name: Build Restaurant Image
        run: docker build -f apps/restaurant/Dockerfile -t khen-restaurant:${{ github.sha }} .

      - name: Build Logistics Image
        run: docker build -f apps/logistics/Dockerfile -t khen-logistics:${{ github.sha }} .
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Prisma in Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)

## Support

For issues related to Docker deployment, please check:
1. Container logs: `docker logs <container-name>`
2. Health check status: `docker inspect --format='{{.State.Health.Status}}' <container-name>`
3. Resource usage: `docker stats`

If problems persist, create an issue with:
- Docker version: `docker --version`
- Docker Compose version: `docker-compose --version`
- Container logs
- System resources (CPU, memory, disk)
