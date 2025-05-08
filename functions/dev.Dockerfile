FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY src ./src
COPY dev.tsconfig.json .
COPY tsconfig.json .
COPY nodemon.json .