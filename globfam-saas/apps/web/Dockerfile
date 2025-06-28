# Dependencies stage
FROM node:18-slim AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Install dependencies
COPY package.json ./
ENV NODE_OPTIONS="--max-old-space-size=512"
RUN npm install --only=production --legacy-peer-deps --no-audit --no-fund && \
    rm -rf /root/.npm

# Builder stage
FROM node:18-slim AS builder
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copy package files
COPY package.json ./

# Install all dependencies
ENV NODE_OPTIONS="--max-old-space-size=768"
RUN npm install --legacy-peer-deps --no-audit --no-fund && \
    rm -rf /root/.npm

# Copy source files
COPY next.config.js ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY tsconfig.json ./
COPY public ./public
COPY src ./src

# Build Next.js app with optimizations
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Runner stage
FROM node:18-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* && \
    addgroup --gid 1001 --system nodejs && \
    adduser --system nodejs --uid 1001

WORKDIR /app

# Copy production files
COPY --from=builder --chown=nodejs:nodejs /app/.next ./.next
COPY --from=builder --chown=nodejs:nodejs /app/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs package*.json ./
COPY --chown=nodejs:nodejs next.config.js ./

USER nodejs

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=512"

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["npm", "start"]