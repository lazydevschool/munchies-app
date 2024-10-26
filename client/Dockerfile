# Build stage
FROM node:lts-alpine AS builder
RUN npm install -g pnpm
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# Production stage
FROM node:lts-alpine 
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile
EXPOSE 5173
CMD ["pnpm", "start"]