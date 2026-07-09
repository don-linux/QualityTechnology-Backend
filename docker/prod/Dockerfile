FROM oven/bun:1.3.13-alpine

WORKDIR /app
ENV NODE_ENV=production

# Copy package files
COPY --chown=bun:bun package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile --production && bun pm cache rm

# Copy source code
COPY --chown=bun:bun index.mjs ./
COPY --chown=bun:bun src ./src

RUN mkdir -p uploads uploads/expedientes uploads/facturas \
  && chown -R bun:bun /app

# Switch to non-root user
USER bun

# Expose the port
EXPOSE 5000

# Start the application
CMD ["bun", "index.mjs"]