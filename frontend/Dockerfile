## Build Next.js (standalone) and run with node server.js
FROM node:18-alpine AS builder
WORKDIR /app

# Accept build-time environment variables for Next.js
ARG NEXT_PUBLIC_API_URL=https://api.advanciapayledger.com
ARG NEXT_PUBLIC_APP_NAME="Advancia PayLedger"
ARG NEXT_PUBLIC_CURRENCY_LIST="USD,EUR,BTC,ETH,USDT,TRUMP,MEDBED"
ARG NEXT_PUBLIC_FEATURE_FLAGS="notifications,bonus_tokens,debit_card,crypto_recovery"
ARG NEXT_PUBLIC_VAPID_KEY
ARG NEXT_PUBLIC_API_KEY
ARG NEXT_PUBLIC_BOTPRESS_BOT_ID

# Set as ENV
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_CURRENCY_LIST=$NEXT_PUBLIC_CURRENCY_LIST
ENV NEXT_PUBLIC_FEATURE_FLAGS=$NEXT_PUBLIC_FEATURE_FLAGS
ENV NEXT_PUBLIC_VAPID_KEY=$NEXT_PUBLIC_VAPID_KEY
ENV NEXT_PUBLIC_API_KEY=$NEXT_PUBLIC_API_KEY
ENV NEXT_PUBLIC_BOTPRESS_BOT_ID=$NEXT_PUBLIC_BOTPRESS_BOT_ID
ENV NODE_ENV=production

# Copy all package files from workspace root
COPY package*.json ./

# Copy frontend package files
COPY frontend/package*.json ./frontend/

# Install workspace dependencies
RUN npm ci --prefer-offline || npm install

# Copy entire frontend source
COPY frontend ./frontend

# Navigate to frontend for build
WORKDIR /app/frontend

# Build Next.js (produces .next/standalone)
RUN npm run build

# Runtime stage
FROM node:18-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Copy public and built assets from builder
COPY --from=builder /app/frontend/public ./public
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./.next/static

# CRITICAL: Copy server.js wrapper to container root
COPY --from=builder /app/frontend/server.js ./server.js

EXPOSE 3000

# Start Next standalone server
CMD ["node", "server.js"]