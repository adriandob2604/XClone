FROM nginx:alpine
WORKDIR /nginx
COPY . .
RUN apk update && apk add --no-cache openssl

COPY nginx.conf /etc/nginx/nginx.conf

COPY ssl_script.sh /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/ssl_script.sh