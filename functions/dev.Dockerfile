FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY src ./src
COPY dev.tsconfig.json .
COPY tsconfig.json .