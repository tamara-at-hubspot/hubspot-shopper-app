FROM node:16

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY ./src ./src
COPY tsconfig.json ./

EXPOSE 8080

CMD ["npm", "start"]
