FROM oven/bun:1.3.13-alpine

ARG USER_UID=1000
ARG USER_GID=1000

RUN apk add --no-cache git openssh-client bash wget shadow postgresql-client

RUN if [ "$USER_GID" != "$(id -g bun)" ]; then groupmod -g "$USER_GID" bun; fi \
 && if [ "$USER_UID" != "$(id -u bun)" ]; then usermod  -u "$USER_UID" bun; fi \
 && mkdir -p /app/node_modules \
 && chown -R bun:bun /app

WORKDIR /app

USER bun

CMD ["sleep", "infinity"]

# Doesn't need COPY since devcontainer mounts the workspace, devcontainer keep the container alive
# and then executes postStartCommand