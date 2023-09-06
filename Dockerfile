# Setup Node
FROM node:18 as base
RUN npm install -g pnpm

WORKDIR /app

# Doing it in this order helps caching
COPY package* pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile

COPY . .

CMD ["pnpm", "dev"]
