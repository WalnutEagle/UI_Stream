# ───────────────────────
# 1) Build stage
# ───────────────────────
FROM node:18-alpine AS builder
WORKDIR /app

# Install deps for build
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ───────────────────────
# 2) Production stage
# ───────────────────────
FROM node:18-alpine
WORKDIR /app

# Copy only the built assets and prod deps
COPY --from=builder /app/dist ./dist
COPY package.json package-lock.json ./
RUN npm ci --production

# Expose the port your start script listens on
EXPOSE 8080

# Use npx to run serve from local node_modules
CMD ["npx", "serve", "-s", "dist", "-l", "8080"]
