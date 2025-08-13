#!/bin/bash

echo "🚀 Starting build process..."

echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing client dependencies..."
cd client
npm install

echo "🔨 Building client..."
npm run build

echo "✅ Build completed successfully!"
