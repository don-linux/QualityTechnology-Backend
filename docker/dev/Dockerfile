FROM node:24.15.0-trixie-slim

ARG USER_UID=1000
ARG USER_GID=1000

RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    libstdc++6 \
    wget \
    git \
    openssh-client \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

RUN if [ "$USER_GID" != "$(id -g node)" ]; then groupmod -g "$USER_GID" node; fi \
 && if [ "$USER_UID" != "$(id -u node)" ]; then usermod  -u "$USER_UID" node; fi \
 && mkdir -p /app/node_modules \
 && chown -R node:node /app

WORKDIR /app

USER node

CMD ["sleep", "infinity"]

# Doesn't need COPY since devcontainer mounts the workspace, devcontainer keep the container alive
# and then executes postStartCommand