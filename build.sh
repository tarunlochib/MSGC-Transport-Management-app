#!/bin/bash

echo "🚀 Starting build process..."

echo "📁 Current directory: $(pwd)"
echo "📁 Directory contents:"
ls -la

echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing client dependencies..."
cd client
npm install

echo "🔨 Building client..."
npm run build

echo "📁 Client dist contents:"
ls -la dist/

echo "📦 Installing server dependencies..."
cd ../server
npm install

echo "📁 Final directory structure:"
cd ..
find . -name "dist" -type d
find . -name "index.html" -type f

echo "✅ Build completed successfully!"
