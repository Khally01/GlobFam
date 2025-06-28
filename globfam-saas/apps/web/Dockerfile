# Use Node.js 18
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (ignore lock file issues)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --production --legacy-peer-deps

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]