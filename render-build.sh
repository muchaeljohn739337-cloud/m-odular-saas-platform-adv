#!/bin/bash
# Render build script for frontend workspace
set -e

echo "🔍 Current directory: $(pwd)"
echo "📦 Installing frontend dependencies..."

# Navigate to frontend directory if not already there
if [ -d "frontend" ]; then
  cd frontend
fi

# Install dependencies
npm ci --include=dev

# Run build
echo "🏗️  Building Next.js application..."
npm run build

echo "✅ Build complete!"
