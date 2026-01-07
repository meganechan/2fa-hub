# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy from backend directory (when build context is root)
COPY backend/package*.json ./
RUN npm install

COPY backend/ .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/main"]
