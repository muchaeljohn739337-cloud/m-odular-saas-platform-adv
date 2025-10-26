# ===== Builder Stage =====
# Creates the Next.js standalone build
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies for building
RUN apk add --no-cache libc6-compat

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

# Copy the rest of your source code
COPY . .

# Build Next.js in standalone mode (outputs to .next/standalone)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# ===== Runner Stage =====
# This is the final, small, and secure image that runs in production
FROM node:18-alpine AS runner
WORKDIR /app

# Set a non-root user for better security
# Fixed to not fail if the user/group already exists
RUN if ! getent group nodejs >/dev/null 2>&1; then addgroup -g 1001 -S nodejs; fi \
    && if ! getent passwd nextjs >/dev/null 2>&1; then adduser -S nextjs -u 1001 -G nodejs; fi

# Copy public assets
COPY --from=builder /app/public ./public

# Copy Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to the non-root user
USER nextjs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

# Start the Next.js standalone server
CMD ["node", "server.js"]