FROM node:22-slim

WORKDIR /app

COPY package*.json ./
COPY node_modules ./node_modules
COPY mock-server.js ./

RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

EXPOSE 4000

CMD ["node", "mock-server.js"]
