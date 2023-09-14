FROM node:18

# install node modules?

WORKDIR /app

COPY index.js .
COPY package.json .
COPY package-lock.json .
COPY .env .

RUN npm install

CMD ["node", "index.js"]
