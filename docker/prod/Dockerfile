# Stage 1: Build the application
FROM oven/bun:1.3.12-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile --production

# Copy source code
COPY index.mjs ./
COPY src ./src

RUN mkdir -p uploads uploads/expedientes uploads/facturas \
  && chown -R bun:bun /app

# Switch to non-root user
USER bun

EXPOSE 5000

ENV NODE_ENV=production

CMD ["bun", "run", "start"]