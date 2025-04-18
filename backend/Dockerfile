FROM node:18-alpine as builder
WORKDIR /app/backend
COPY backend/ .
RUN npm install
EXPOSE 5000
CMD ["node", "server.js"]