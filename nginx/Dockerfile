FROM nginx:alpine as builder
RUN apk update && apk add --no-cache openssl
RUN chmod +x ssl_script.sh
COPY nginx.conf /etc/nginx/nginx.conf
COPY ssl_conf.env /etc/nginx/.env
COPY ssl_script.sh /docker-entrypoint.d/ssl_script.sh