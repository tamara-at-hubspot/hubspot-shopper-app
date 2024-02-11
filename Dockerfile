FROM node:16

WORKDIR /app

COPY package*.json .
COPY .env* .
COPY tsconfig.json .

RUN npm ci

EXPOSE 3000
