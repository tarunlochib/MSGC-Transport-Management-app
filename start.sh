#!/bin/bash

echo "🚀 Starting server..."

# Set default port if not provided
export PORT=${PORT:-10000}

echo "📡 Server will run on port: $PORT"

# Start the server
node server/index.js
