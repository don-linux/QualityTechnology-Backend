FROM oven/bun:1.3.11-alpine

# Useful toolchain for projects with node-gyp
RUN apk add --no-cache git openssh-client bash postgresql-client

WORKDIR /app

# devcontainer keeps it alive and then executes postStartCommand
CMD ["sleep", "infinity"]