FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
RUN chown -R node:node .
USER node
CMD ["node", "server.js"]