# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy from frontend directory (when build context is root)
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

# Production stage - use serve instead of nginx
FROM node:20-alpine AS production
WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

ENV PORT=80
EXPOSE 80

CMD ["serve", "-s", "dist", "-l", "80"]
