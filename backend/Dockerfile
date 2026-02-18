FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
FROM base AS dev
CMD ["npm", "run", "dev"]
