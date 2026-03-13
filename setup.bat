@echo off
REM Chat Application Setup Script for Windows
REM This script automates the setup process

setlocal enabledelayedexpansion

echo ======================================
echo Chat Application Setup Script
echo ======================================
echo.

REM Check prerequisites
echo Checking prerequisites...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% found

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✅ npm %NPM_VERSION% found

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker
    exit /b 1
)
echo ✅ Docker found

where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose
    exit /b 1
)
echo ✅ Docker Compose found

echo.
echo ======================================
echo Installing Dependencies
echo ======================================
echo.

REM Frontend dependencies
echo 📦 Installing frontend dependencies...
call npm install

REM Backend dependencies
echo 📦 Installing backend dependencies...
cd backenddev-master
call npm install
cd ..

echo.
echo ======================================
echo Setting Up Environment Variables
echo ======================================
echo.

REM Backend .env
if not exist backenddev-master\.env (
    echo Creating backend .env from template...
    copy backenddev-master\.env.example backenddev-master\.env
    echo ✅ Backend .env created. Please edit it with your settings.
) else (
    echo ⚠️  Backend .env already exists. Skipping...
)

REM Frontend .env
if not exist .env (
    echo Creating frontend .env from template...
    copy .env.example .env
    echo ✅ Frontend .env created.
) else (
    echo ⚠️  Frontend .env already exists. Skipping...
)

echo.
echo ======================================
echo Starting Docker Services
echo ======================================
echo.

cd backenddev-master
echo 🐳 Starting PostgreSQL, Redis, and Backend...
docker-compose up -d

echo ⏳ Waiting for services to be healthy (30-60 seconds)...
timeout /t 30 /nobreak

echo ✅ Services started
echo.

REM Verify services
echo Verifying services...
docker exec chatapp-postgres pg_isready >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL is ready
) else (
    echo ❌ PostgreSQL is not ready
)

docker exec chatapp-redis redis-cli ping >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ Redis is ready
) else (
    echo ❌ Redis is not ready
)

cd ..

echo.
echo ======================================
echo Setup Complete! ✅
echo ======================================
echo.
echo Next steps:
echo.
echo 1. Edit configuration files (if needed):
echo    - backenddev-master\.env (JWT secrets, email settings, etc.)
echo    - .env (API and WebSocket URLs)
echo.
echo 2. In Terminal 1 - Start frontend:
echo    npm run dev
echo.
echo 3. In Terminal 2 - Monitor backend logs:
echo    cd backenddev-master && docker-compose logs -f
echo.
echo 4. Access the application:
echo    Frontend: http://localhost:5173
echo    Backend API: http://localhost:4000
echo.
echo ======================================

pause
