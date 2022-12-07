FROM node:alpine

WORKDIR /usr/src/dashboard-backend

COPY . .

RUN npm install

EXPOSE 5001

CMD [ "npm", "start" ]
