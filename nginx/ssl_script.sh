#!/bin/bash

set -e
. .env

mkdir -p /etc/nginx/ssl

openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -subj "$CERT_SUBJ" \
  -keyout /etc/nginx/ssl/certs/ssl_key.key \
  -out /etc/nginx/ssl/certs/ssl_cert.crt