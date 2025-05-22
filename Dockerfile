FROM node:18

WORKDIR /base

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4393

CMD ["node", "index.js"]
