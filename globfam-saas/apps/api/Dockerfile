# Dependencies stage - production only
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy package files
COPY package.json ./
COPY prisma ./prisma/

# Install production dependencies only (without postinstall)
ENV NODE_OPTIONS="--max-old-space-size=512"
RUN npm install --only=production --legacy-peer-deps --no-audit --no-fund --ignore-scripts && \
    rm -rf /root/.npm

# Builder stage - all dependencies
FROM node:18-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy package files
COPY package.json ./
COPY prisma ./prisma/

# Install ALL dependencies including dev (needed for build)
ENV NODE_OPTIONS="--max-old-space-size=512"
RUN npm install --legacy-peer-deps --no-audit --no-fund && \
    rm -rf /root/.npm

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build application
RUN npm run build

# Runner stage - production
FROM node:18-alpine AS runner
RUN apk add --no-cache libc6-compat openssl && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy production dependencies from deps stage
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy Prisma client from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --chown=nodejs:nodejs package.json ./
COPY --chown=nodejs:nodejs prisma ./prisma

USER nodejs

EXPOSE 3001

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy --skip-seed && node dist/index.js"]