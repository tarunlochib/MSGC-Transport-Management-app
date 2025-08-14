#!/bin/bash

echo "🚀 Testing MSGC Transport App Deployment Configuration"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy env.example to .env and configure your variables."
    exit 1
fi

echo "✅ .env file found"

# Load environment variables
source .env

# Check required variables
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set in .env"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET not set in .env"
    exit 1
fi

echo "✅ Environment variables configured"

# Build and test Docker image
echo "🔨 Building Docker image..."
docker build -t msgc-transport-app-test .

if [ $? -eq 0 ]; then
    echo "✅ Docker build successful"
else
    echo "❌ Docker build failed"
    exit 1
fi

# Test with Docker Compose
echo "🧪 Testing with Docker Compose..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for service to start
echo "⏳ Waiting for service to start..."
sleep 10

# Test health endpoint
echo "🏥 Testing health endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:10000/api/health)

if [ "$response" = "200" ]; then
    echo "✅ Health check passed (HTTP $response)"
else
    echo "❌ Health check failed (HTTP $response)"
fi

# Test test endpoint
echo "🧪 Testing test endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:10000/api/test)

if [ "$response" = "200" ]; then
    echo "✅ Test endpoint passed (HTTP $response)"
else
    echo "❌ Test endpoint failed (HTTP $response)"
fi

echo "🎉 Deployment test completed!"
echo "🌐 Your app is running at: http://localhost:10000"
echo "📊 Health check: http://localhost:10000/api/health"

# Stop the service
echo "🛑 Stopping test service..."
docker-compose -f docker-compose.prod.yml down

echo "✨ Test completed successfully!"
