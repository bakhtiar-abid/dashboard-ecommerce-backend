FROM node:slim

WORKDIR /usr/src/dashboard-backend

COPY ./ ./

RUN npm install

EXPOSE 5001

CMD [ "node", "index.js" ]
