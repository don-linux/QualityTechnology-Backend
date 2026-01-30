FROM node:24.11.1-alpine3.22

# Useful toolchain for projects with node-gyp
RUN apk add --no-cache openssh-client

WORKDIR /app

# devcontainer keeps it alive and then executes postStartCommand
CMD ["sleep", "infinity"]