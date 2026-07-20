FROM node:22-alpine3.22

ENV TZ=America/La_Paz
ENV APP_HOME=/app
ENV NODE_ENV=production

WORKDIR $APP_HOME

RUN apk upgrade --no-cache

COPY package*.json ./
COPY node_modules ./node_modules
COPY index.js ./
COPY schemas ./schemas
COPY src ./src

RUN npm prune --omit=dev \
    && addgroup -S app-group \
    && adduser -S -G app-group -h $APP_HOME -s /sbin/nologin usr-app \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx \
    && chown -R usr-app:app-group $APP_HOME

USER usr-app

ENV PORT=3000
EXPOSE $PORT

CMD ["node", "./index.js"]
