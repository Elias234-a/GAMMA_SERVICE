# Base image
FROM node:18-alpine AS base

# Metadata
LABEL maintainer="GAMMA Service ERP"
LABEL description="Backend API for GAMMA Service ERP"

# Set working directory
WORKDIR /app

# Install dependencies for production
FROM base AS dependencies
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Install all dependencies (including dev) for build
FROM base AS build-dependencies
COPY package*.json ./
RUN npm ci && \
    npm cache clean --force

# Development stage
FROM base AS development
WORKDIR /app
COPY --from=build-dependencies /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=development
EXPOSE 8001
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy production dependencies
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Create necessary directories
RUN mkdir -p logs uploads && \
    chown -R nodejs:nodejs logs uploads

# Switch to non-root user
USER nodejs

# Environment variables
ENV NODE_ENV=production \
    PORT=8001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Expose port
EXPOSE 8001

# Start application
CMD ["npm", "start"]
