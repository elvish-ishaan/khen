@echo off
REM Build script for all Docker images in the Daavat Food Delivery Platform (Windows)

echo Building all Docker images for Daavat Food Delivery Platform
echo ================================================================

REM Get the current git commit SHA for tagging (optional)
for /f %%i in ('git rev-parse --short HEAD 2^>nul') do set GIT_SHA=%%i
if "%GIT_SHA%"=="" set GIT_SHA=latest

echo.
echo Building API Backend...
docker build -f apps/api/Dockerfile -t daavat-api:%GIT_SHA% -t daavat-api:latest .
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo Building User Frontend...
docker build -f apps/user/Dockerfile -t daavat-user:%GIT_SHA% -t daavat-user:latest .
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo Building Restaurant Frontend...
docker build -f apps/restaurant/Dockerfile -t daavat-restaurant:%GIT_SHA% -t daavat-restaurant:latest .
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo Building Logistics Frontend...
docker build -f apps/logistics/Dockerfile -t daavat-logistics:%GIT_SHA% -t daavat-logistics:latest .
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo ================================================================
echo All images built successfully!
echo.
echo Built images:
echo   - daavat-api:%GIT_SHA% (also tagged as daavat-api:latest)
echo   - daavat-user:%GIT_SHA% (also tagged as daavat-user:latest)
echo   - daavat-restaurant:%GIT_SHA% (also tagged as daavat-restaurant:latest)
echo   - daavat-logistics:%GIT_SHA% (also tagged as daavat-logistics:latest)
echo.
echo To run all services:
echo   docker-compose -f docker-compose.production.yml up -d
