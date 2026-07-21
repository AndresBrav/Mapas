FROM node:22-slim

ENV TZ=America/La_Paz
ENV APP_HOME=/app
ENV NODE_ENV=production

WORKDIR $APP_HOME

RUN apt-get update && apt-get upgrade -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY node_modules ./node_modules
COPY index.js ./
COPY schemas ./schemas
COPY src ./src
COPY docs ./docs
COPY scripts ./scripts

RUN npm prune --omit=dev \
    && addgroup --system app-group \
    && adduser --system --ingroup app-group --home $APP_HOME --shell /usr/sbin/nologin usr-app \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx \
    && chown -R usr-app:app-group $APP_HOME

USER usr-app

ENV PORT=3000
EXPOSE $PORT

CMD ["node", "./index.js"]
