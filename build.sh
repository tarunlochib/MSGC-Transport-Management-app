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

echo "📁 Copying dist to root for easier access..."
cp -r dist ../dist-root

echo "📦 Installing server dependencies..."
cd ../server
npm install

echo "📁 Final directory structure:"
cd ..
echo "📁 Root contents:"
ls -la
echo "📁 Client contents:"
ls -la client/
echo "📁 Server contents:"
ls -la server/
echo "📁 Dist-root contents:"
ls -la dist-root/

echo "🔍 Finding all dist folders:"
find . -name "dist" -type d 2>/dev/null

echo "🔍 Finding all index.html files:"
find . -name "index.html" -type f 2>/dev/null

echo "✅ Build completed successfully!"
