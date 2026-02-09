#!/bin/bash
# Build script for all Docker images in the Daavat Food Delivery Platform

set -e

echo "🚀 Building all Docker images for Daavat Food Delivery Platform"
echo "================================================================"

# Get the current git commit SHA for tagging (optional)
GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")

echo ""
echo "📦 Building API Backend..."
docker build -f apps/api/Dockerfile -t daavat-api:${GIT_SHA} -t daavat-api:latest .

echo ""
echo "📦 Building User Frontend..."
docker build -f apps/user/Dockerfile -t daavat-user:${GIT_SHA} -t daavat-user:latest .

echo ""
echo "📦 Building Restaurant Frontend..."
docker build -f apps/restaurant/Dockerfile -t daavat-restaurant:${GIT_SHA} -t daavat-restaurant:latest .

echo ""
echo "📦 Building Logistics Frontend..."
docker build -f apps/logistics/Dockerfile -t daavat-logistics:${GIT_SHA} -t daavat-logistics:latest .

echo ""
echo "================================================================"
echo "✅ All images built successfully!"
echo ""
echo "Built images:"
echo "  - daavat-api:${GIT_SHA} (also tagged as daavat-api:latest)"
echo "  - daavat-user:${GIT_SHA} (also tagged as daavat-user:latest)"
echo "  - daavat-restaurant:${GIT_SHA} (also tagged as daavat-restaurant:latest)"
echo "  - daavat-logistics:${GIT_SHA} (also tagged as daavat-logistics:latest)"
echo ""
echo "To run all services:"
echo "  docker-compose -f docker-compose.production.yml up -d"
