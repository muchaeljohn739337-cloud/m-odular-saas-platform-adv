## Build Next.js (standalone) and run with node server.js

FROM node:18-alpine AS builder
WORKDIR /app

# Copy only package manifests and install
COPY package*.json ./
RUN npm ci || true

# Copy frontend app sources
COPY . ./

# Install frontend deps and build
RUN npm ci && npm run build

FROM node:18-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Copy public and standalone output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
