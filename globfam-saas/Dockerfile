# Root Dockerfile that builds the API
FROM node:18-alpine

WORKDIR /app

# Copy API files
COPY apps/api/package*.json ./
COPY apps/api/prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy API source
COPY apps/api/ ./

# Build
RUN npm run build

# Expose port
EXPOSE 3001

# Start
CMD ["npm", "start"]