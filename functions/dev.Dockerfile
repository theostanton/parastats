FROM node:22-alpine

WORKDIR /app

# Install functions dependencies
COPY functions/package.json ./
COPY functions/yarn.lock ./
# Remove common package dependency for development (using path mapping instead)  
RUN sed -i '/"@parastats\/common":/d' package.json
RUN yarn install

COPY functions/src ./src
COPY functions/dev.tsconfig.json .
COPY functions/tsconfig.json .