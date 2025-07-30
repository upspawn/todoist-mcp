FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:20-alpine
RUN addgroup -g 1001 -S nodejs && adduser -S mcp -u 1001
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=mcp:nodejs dist ./dist
COPY --chown=mcp:nodejs package.json ./
RUN chmod +x dist/index.js
USER mcp
EXPOSE 3000
CMD ["node", "dist/index.js"] 