FROM node:alpine

RUN apk update

WORKDIR /opt/src/app
COPY package.json .

RUN npm install

COPY server.js .
COPY responsibles.json .

EXPOSE 3000

CMD ["npm", "start"]