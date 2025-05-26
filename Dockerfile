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
# Using Red Hat UBI 8 with Node.js 18
FROM registry.redhat.io/ubi8/nodejs-18:latest AS builder

# The default UBI user might not have permissions in /
# So we explicitly set user to 0 for global installs if needed,
# or ensure our WORKDIR is owned by the default user (1001).
# For npm ci and npm run build, the default user (1001) in WORKDIR /app should be fine.
USER 0
WORKDIR /opt/app-root/src
# WORKDIR /app # Original path - /opt/app-root/src is more standard for S2I-like builds
              # but /app is fine for Docker builds. Let's stick to /app for direct translation.
WORKDIR /app
USER 1001 # Switch to the default non-root user for UBI images

# Install deps for build
COPY --chown=1001:0 package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY --chown=1001:0 . .
RUN npm run build

# ───────────────────────
# 2) Production stage
# ───────────────────────
# Using Red Hat UBI 8 with Node.js 18 minimal for a smaller runtime image
FROM registry.redhat.io/ubi8/nodejs-18-minimal:latest AS production
# Or, if you prefer consistency and don't mind a slightly larger image:
# FROM registry.redhat.io/ubi8/nodejs-18:latest AS production

USER 0
WORKDIR /opt/app-root/src # Standard OpenShift WORKDIR
# WORKDIR /app # Again, /app is fine if you prefer.
              # Let's use /app for consistency with your original.
WORKDIR /app
USER 1001 # Switch to the default non-root user

# Copy only the built assets and prod deps
COPY --from=builder --chown=1001:0 /app/dist ./dist
COPY --chown=1001:0 package.json package-lock.json ./
RUN npm ci --production

# Expose the port your start script listens on
EXPOSE 8080

# Use npx to run serve from local node_modules
# The default UBI user (1001) will run this.
CMD ["npx", "serve", "-s", "dist", "-l", "8080"]