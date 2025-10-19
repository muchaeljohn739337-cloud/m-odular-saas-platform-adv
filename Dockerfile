# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy the entire project
COPY . .

# Install root dependencies
RUN npm ci

# Change to frontend and install frontend dependencies
WORKDIR /app/frontend
RUN npm ci

# Build the frontend
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app/frontend

# Copy only necessary files from builder
COPY --from=builder /app/frontend/package*.json ./
COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/frontend/public ./public
COPY --from=builder /app/frontend/next.config.js ./

# Install production dependencies only
RUN npm ci --omit=dev

EXPOSE 3000

CMD ["npm", "start"]
