FROM oven/bun:1.3.11-alpine

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY index.mjs ./
COPY src ./src

RUN mkdir -p uploads uploads/expedientes uploads/facturas \
  && chown -R bun:bun /app

USER bun

EXPOSE 5000

ENV NODE_ENV=production

CMD ["bun", "run", "start"]