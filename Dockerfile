# # ───────────────────────
# # 1) Build stage
# # ───────────────────────
# FROM node:18-alpine AS builder

# WORKDIR /app

# # Install deps for build
# COPY package.json package-lock.json ./
# RUN npm ci

# # Copy source and build
# COPY . .
# RUN npm run build

# # ───────────────────────
# # 2) Production stage
# # ───────────────────────


# FROM node:18-alpine
# WORKDIR /app

# # Copy only the built assets and prod deps
# COPY --from=builder /app/dist ./dist
# COPY package.json package-lock.json ./
# RUN npm ci --production

# # Expose the port your start script listens on
# EXPOSE 8080

# # Use npx to run serve from local node_modules
# CMD ["npx", "serve", "-s", "dist", "-l", "8080"]



# ───────────────────────
# 1) Build stage
# ───────────────────────
FROM registry.redhat.io/ubi8/nodejs-18:latest AS builder

# Set the user *before* WORKDIR so the directory is owned by this user
USER 1001
WORKDIR /app

# Copy package files and ensure they are owned by user 1001
COPY --chown=1001:0 package.json package-lock.json ./
RUN npm ci

# Copy source and build, ensuring ownership
COPY --chown=1001:0 . .
RUN npm run build

# ───────────────────────
# 2) Production stage
# ───────────────────────
FROM registry.redhat.io/ubi8/nodejs-18-minimal:latest

# Set the user *before* WORKDIR
USER 1001
WORKDIR /app

# Copy only the built assets and prod deps, ensuring ownership
# Note: Ensure you copy package.json and package-lock.json from the builder's /app directory
# if they were potentially modified or if you want to be absolutely sure you're using the ones
# that correspond to the state after the builder's `npm ci`.
# For a simple `npm ci`, copying from the context is usually fine, but for consistency:
COPY --from=builder --chown=1001:0 /app/dist ./dist
COPY --from=builder --chown=1001:0 /app/package.json ./package.json
COPY --from=builder --chown=1001:0 /app/package-lock.json ./package-lock.json
# If you are sure package.json/lock are not changed in build stage and want to use original:
# COPY --chown=1001:0 package.json package-lock.json ./

RUN npm ci --production

# Expose the port your start script listens on
EXPOSE 8080

# Use npx to run serve from local node_modules
# This will run as user 1001
CMD ["npx", "serve", "-s", "dist", "-l", "8080"]