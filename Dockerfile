## Multi-stage Dockerfile to serve Next.js (standalone)

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy only package manifests to leverage Docker cache
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy app sources
COPY frontend/ ./

# Build (produces .next/standalone when output: 'standalone' is set)
RUN npm run build

# Production runner
FROM node:18-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Copy public assets and standalone server
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose default Next.js port (Render will map $PORT)
EXPOSE 3000

# Start the standalone server directly (no shell, no cd)
CMD ["node", "server.js"]
