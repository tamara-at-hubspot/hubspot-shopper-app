FROM node:16

WORKDIR /app/src
COPY src/package.json ./
RUN npm install

EXPOSE 3000
