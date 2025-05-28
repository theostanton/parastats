# syntax=docker.io/docker/dockerfile:1

FROM node:18-alpine AS base

# Step 1. Rebuild the source code only when needed
FROM base AS builder

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json ./
COPY yarn.lock ./
# Omit --production flag for TypeScript devDependencies
RUN yarn

COPY src ./src
COPY public ./public
COPY next.config.js .
COPY tsconfig.json .

# Buildtime
ARG DATABASE_HOST
ENV DATABASE_HOST=${DATABASE_HOST}
ARG DATABASE_NAME
ENV DATABASE_NAME=${DATABASE_NAME}
ARG DATABASE_PASSWORD
ENV DATABASE_PASSWORD=${DATABASE_PASSWORD}
ARG DATABASE_PORT
ENV DATABASE_PORT=${DATABASE_PORT}
ARG DATABASE_USER
ENV DATABASE_USER=${DATABASE_USER}

# Build Next.js
RUN yarn build;

# Step 2. Production image, copy all the files and run next
FROM base AS runner

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

CMD ["node", "server.js"]
