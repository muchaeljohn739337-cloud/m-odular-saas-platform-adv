## Build Next.js (standalone) and run with node server.js

FROM node:18-alpine AS builder
WORKDIR /app

# Copy only frontend package manifests for better cache usage
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend sources
COPY frontend/ ./

# Build Next.js (produces .next/standalone)
RUN npm run build

FROM node:18-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Copy public assets and server
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
