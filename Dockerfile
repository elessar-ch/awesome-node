FROM node:lts
ENV PORT 8080
ENV NODE_ENV=production
WORKDIR /app

COPY . .
RUN npm install --production

CMD [ "node", "server.js" ]
