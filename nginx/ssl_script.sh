#!/bin/sh

set -e
. /etc/nginx/ssl_conf.env

mkdir -p /etc/nginx/ssl/certs

openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -subj "$CERT_SUBJ" \
  -keyout /etc/nginx/ssl/certs/ssl_key.key \
  -out /etc/nginx/ssl/certs/ssl_cert.crt
chmod 600 /etc/nginx/ssl/certs/ssl_key.key /etc/nginx/ssl/certs/ssl_cert.crt