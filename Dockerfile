FROM node:12-alpine

ARG NODE_ENV=local
ENV NODE_ENV=${NODE_ENV}

RUN mkdir /app

WORKDIR /app

COPY package*.json ./

RUN npm install -g npm@latest
RUN npm install -g jest
RUN npm install

COPY . .

CMD [ "npm", "run", "start" ]