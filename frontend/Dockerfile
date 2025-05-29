FROM node:18-alpine as builder
WORKDIR /app/frontend
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "dev"]
