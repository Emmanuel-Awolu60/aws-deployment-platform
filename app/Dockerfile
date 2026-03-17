FROM node:18-alpine

WORKDIR /app

COPY package.json .

RUN install --production 

COPY src/ ./src/

EXPOSE 3000

CMD [ "node", "/src/index.js" ]