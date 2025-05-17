# syntax=docker.io/docker/dockerfile:1

FROM node:24-alpine as base

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* .npmrc* ./
RUN yarn --frozen-lockfile

COPY src ./src
COPY public ./public
COPY next.config.js .
COPY tsconfig.json .

# Next.js collects completely anonymous telemetry data about general usage. Learn more here: https://nextjs.org/telemetry
# Uncomment the following line to disable telemetry at run time
# ENV NEXT_TELEMETRY_DISABLED 1

# Note: Don't expose ports here, Compose will handle that for us

# Start Next.js in development mode based on the preferred package manager
CMD yarn dev
