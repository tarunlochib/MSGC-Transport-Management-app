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

echo "📁 Copying dist to multiple locations for Render..."
# Copy to client/dist (original location)
echo "📁 Copying to client/dist..."
cp -r dist ../client/dist 2>/dev/null || echo "⚠️ Could not copy to client/dist"

# Copy to root dist folder
echo "📁 Copying to root dist..."
cp -r dist ../dist 2>/dev/null || echo "⚠️ Could not copy to root dist"

# Copy to dist-root for backup
echo "📁 Copying to dist-root..."
cp -r dist ../dist-root 2>/dev/null || echo "⚠️ Could not copy to dist-root"

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

echo "🔍 Finding all dist folders:"
find . -name "dist" -type d 2>/dev/null

echo "🔍 Finding all index.html files:"
find . -name "index.html" -type f 2>/dev/null

echo "🔍 Checking specific paths Render will look for:"
echo "📁 Checking /opt/render/project/src/client/dist:"
if [ -d "client/dist" ] && [ -f "client/dist/index.html" ]; then
    echo "✅ client/dist/index.html exists"
else
    echo "❌ client/dist/index.html missing"
fi

echo "📁 Checking /opt/render/project/src/dist:"
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✅ dist/index.html exists"
else
    echo "❌ dist/index.html missing"
fi

echo "🔍 Running post-build verification..."
node post-build-check.js

echo "✅ Build completed successfully!"
