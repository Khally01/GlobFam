FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy prebuild script and source
COPY prebuild.js ./
COPY src ./src
COPY next.config.js ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Create public folder if it doesn't exist
RUN mkdir -p public

# Run prebuild to fix dependencies
RUN node prebuild.js

# Build the Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]