FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4006
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "require('http').get('http://localhost:4006/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
USER node
CMD ["node", "src/server.js"]
