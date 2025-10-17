# Stage 1: Install dependencies
FROM node:20-alpine AS install
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
# Use npm to install dependencies
RUN npm ci

# Stage 2: Build the Next.js application
FROM install AS builder
WORKDIR /usr/src/app
COPY --from=install /usr/src/app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production image
# Start from a clean base image to keep the final image small.
FROM node:20-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Copy only the essential artifacts from the builder stage.
# This is possible because of the `output: 'standalone'` configuration.
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/.next/standalone ./
COPY --from=builder /usr/src/app/.next/static ./.next/static

# Expose the default port for the Next.js standalone server.
EXPOSE 3000

# The standalone output produces a Node.js server script.
CMD ["node", "server.js"]
