# Frontend
FROM node:19 AS ui

WORKDIR /app
COPY package*.json vite.config.ts svelte.config.js tsconfig.json ./
COPY ./src ./src
COPY ./static ./static

RUN npm install && npm run build

# Backend


# Production
FROM node:19 AS runner

COPY --from=ui /app/package*.json /app/build /.
RUN npm ci --only=production
EXPOSE 3000
CMD ["node", "index.js"]
