@echo off
REM Build script for all Docker images in the Khen Food Delivery Platform (Windows)

echo Building all Docker images for Khen Food Delivery Platform
echo ================================================================

REM Get the current git commit SHA for tagging (optional)
for /f %%i in ('git rev-parse --short HEAD 2^>nul') do set GIT_SHA=%%i
if "%GIT_SHA%"=="" set GIT_SHA=latest

echo.
echo Building API Backend...
docker build -f apps/api/Dockerfile -t khen-api:%GIT_SHA% -t khen-api:latest .
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo Building User Frontend...
docker build -f apps/user/Dockerfile -t khen-user:%GIT_SHA% -t khen-user:latest .
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo Building Restaurant Frontend...
docker build -f apps/restaurant/Dockerfile -t khen-restaurant:%GIT_SHA% -t khen-restaurant:latest .
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo Building Logistics Frontend...
docker build -f apps/logistics/Dockerfile -t khen-logistics:%GIT_SHA% -t khen-logistics:latest .
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo ================================================================
echo All images built successfully!
echo.
echo Built images:
echo   - khen-api:%GIT_SHA% (also tagged as khen-api:latest)
echo   - khen-user:%GIT_SHA% (also tagged as khen-user:latest)
echo   - khen-restaurant:%GIT_SHA% (also tagged as khen-restaurant:latest)
echo   - khen-logistics:%GIT_SHA% (also tagged as khen-logistics:latest)
echo.
echo To run all services:
echo   docker-compose -f docker-compose.production.yml up -d
