FROM oven/bun:1.3.12-alpine

RUN apk add --no-cache git openssh-client bash postgresql-client

WORKDIR /app

RUN chown bun:bun /app

USER bun

CMD ["sleep", "infinity"]