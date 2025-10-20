# Stage 1: Install dependencies
# Use the official lightweight Bun image for a small and fast installation.
FROM oven/bun:1-alpine AS install
WORKDIR /usr/src/app
COPY package.json ./
# Use Bun to install dependencies and generate fresh lockfile
RUN bun install

# Stage 2: Build the Next.js application
FROM install AS builder
WORKDIR /usr/src/app
COPY --from=install /usr/src/app/node_modules ./node_modules
COPY . .
RUN bun run build

# Stage 3: Production image
# Start from a clean base image to keep the final image small.
FROM oven/bun:1-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Copy only the essential artifacts from the builder stage.
# This is possible because of the `output: 'standalone'` configuration.
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/.next/standalone ./
COPY --from=builder /usr/src/app/.next/static ./.next/static

# Copy migration files and database dependencies for runtime migrations
COPY --from=builder /usr/src/app/drizzle ./drizzle
COPY --from=builder /usr/src/app/scripts/migrate.ts ./scripts/migrate.ts
COPY --from=builder /usr/src/app/lib/db ./lib/db
COPY --from=builder /usr/src/app/node_modules/drizzle-orm ./node_modules/drizzle-orm
COPY --from=builder /usr/src/app/node_modules/postgres ./node_modules/postgres
COPY --from=builder /usr/src/app/node_modules/tsx ./node_modules/tsx

# Create startup script that runs migrations then starts the server
RUN echo '#!/bin/sh' > /usr/src/app/start.sh && \
    echo 'echo "🚀 Starting application..."' >> /usr/src/app/start.sh && \
    echo 'echo "📦 Running database migrations..."' >> /usr/src/app/start.sh && \
    echo 'bun run scripts/migrate.ts' >> /usr/src/app/start.sh && \
    echo 'if [ $? -eq 0 ]; then' >> /usr/src/app/start.sh && \
    echo '  echo "✅ Migrations completed successfully"' >> /usr/src/app/start.sh && \
    echo '  echo "🌐 Starting Next.js server..."' >> /usr/src/app/start.sh && \
    echo '  exec node server.js' >> /usr/src/app/start.sh && \
    echo 'else' >> /usr/src/app/start.sh && \
    echo '  echo "❌ Migration failed. Exiting..."' >> /usr/src/app/start.sh && \
    echo '  exit 1' >> /usr/src/app/start.sh && \
    echo 'fi' >> /usr/src/app/start.sh && \
    chmod +x /usr/src/app/start.sh

# Expose the default port for the Next.js standalone server.
EXPOSE 3000

# Run startup script that handles migrations and server start
CMD ["/usr/src/app/start.sh"]
