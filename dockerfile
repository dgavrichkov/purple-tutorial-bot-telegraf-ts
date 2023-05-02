FROM node:latest

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install && npm cache clean --force

COPY . .

RUN npm run build

EXPOSE 8080

CMD [ "npm", "start" ]