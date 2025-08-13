#!/bin/bash

echo "🚀 Render Build Script Starting..."

echo "📁 Current directory: $(pwd)"
echo "📁 Directory contents:"
ls -la

echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing client dependencies..."
cd client
npm install

echo "🔨 Building React app..."
npm run build

echo "📁 Client dist contents:"
ls -la dist/

echo "📁 Copying dist to root level..."
cd ..
cp -r client/dist ./dist

echo "📁 Verifying root dist folder:"
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✅ dist/index.html exists at root level"
    ls -la dist/
else
    echo "❌ dist/index.html missing at root level"
fi

echo "📦 Installing server dependencies..."
cd server
npm install

echo "📁 Final verification:"
cd ..
echo "📁 Root contents:"
ls -la
echo "📁 Dist contents:"
ls -la dist/

echo "✅ Render build completed successfully!"
