# Build stage
FROM node:18-alpine AS builder

WORKDIR /app/frontend

# Copy only frontend files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy frontend source
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/next.config.js ./
COPY frontend/tsconfig.json ./
COPY frontend/tailwind.config.js ./
COPY frontend/postcss.config.js ./

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
RUN npm install --omit=dev

EXPOSE 3000

CMD ["npm", "start"]
