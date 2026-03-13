#!/bin/bash

# Chat Application Setup Script
# This script automates the setup process

set -e

echo "======================================"
echo "Chat Application Setup Script"
echo "======================================"
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi
echo "✅ Node.js $(node -v) found"

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi
echo "✅ npm $(npm -v) found"

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker"
    exit 1
fi
echo "✅ Docker $(docker --version) found"

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose"
    exit 1
fi
echo "✅ Docker Compose found"

echo ""
echo "======================================"
echo "Installing Dependencies"
echo "======================================"
echo ""

# Frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Backend dependencies
echo "📦 Installing backend dependencies..."
cd backenddev-master
npm install
cd ..

echo ""
echo "======================================"
echo "Setting Up Environment Variables"
echo "======================================"
echo ""

# Backend .env
if [ ! -f backenddev-master/.env ]; then
    echo "Creating backend .env from template..."
    cp backenddev-master/.env.example backenddev-master/.env
    echo "✅ Backend .env created. Please edit it with your settings."
else
    echo "⚠️  Backend .env already exists. Skipping..."
fi

# Frontend .env
if [ ! -f .env ]; then
    echo "Creating frontend .env from template..."
    cp .env.example .env
    echo "✅ Frontend .env created."
else
    echo "⚠️  Frontend .env already exists. Skipping..."
fi

echo ""
echo "======================================"
echo "Starting Docker Services"
echo "======================================"
echo ""

cd backenddev-master
echo "🐳 Starting PostgreSQL, Redis, and Backend..."
docker-compose up -d

echo "⏳ Waiting for services to be healthy (30-60 seconds)..."
sleep 30

# Check if services are healthy
if ! docker-compose ps | grep -q "healthy"; then
    echo "⚠️  Services still starting. Waiting a bit more..."
    sleep 30
fi

echo "✅ Services started"
echo ""

# Verify services
echo "Verifying services..."
if docker exec chatapp-postgres pg_isready &> /dev/null; then
    echo "✅ PostgreSQL is ready"
else
    echo "❌ PostgreSQL is not ready"
fi

if docker exec chatapp-redis redis-cli ping &> /dev/null; then
    echo "✅ Redis is ready"
else
    echo "❌ Redis is not ready"
fi

cd ..

echo ""
echo "======================================"
echo "Setup Complete! ✅"
echo "======================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Edit configuration files (if needed):"
echo "   - backenddev-master/.env (JWT secrets, email settings, etc.)"
echo "   - .env (API and WebSocket URLs)"
echo ""
echo "2. In Terminal 1 - Start frontend:"
echo "   npm run dev"
echo ""
echo "3. In Terminal 2 - Monitor backend logs:"
echo "   cd backenddev-master && docker-compose logs -f"
echo ""
echo "4. Access the application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:4000"
echo ""
echo "======================================"
