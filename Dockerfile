# Build stage
FROM node:16-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Build the webpack bundle
RUN npm run build

# Production stage
FROM node:16-alpine

WORKDIR /app

# Install build tools for sqlite3
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/assets ./assets
COPY --from=builder /app/index.html ./
COPY index.js .
COPY src ./src

# Remove opn from node_modules to prevent browser auto-open in containers
RUN rm -rf node_modules/opn

# Create volume for database persistence
VOLUME /app/data

# Expose port
EXPOSE 8082

# Start server
CMD ["node", "index.js"]
