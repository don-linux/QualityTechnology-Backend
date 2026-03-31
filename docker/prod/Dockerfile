FROM oven/bun:1.3.11-alpine

RUN apk add --no-cache openssh-client

WORKDIR /app

RUN chown bun:bun /app

USER bun

CMD ["sleep", "infinity"]