FROM node:18-alpine as builder
WORKDIR /app/frontend
COPY frontend/ .
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "dev"]
