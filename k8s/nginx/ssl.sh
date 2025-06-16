#!/bin/bash

CERT_NAME="cache-tls"
NAMESPACE="default"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key \
  -out tls.crt \
  -subj "/CN=cache/O=cache"

kubectl create secret tls $CERT_NAME \
  --key tls.key \
  --cert tls.crt \
  --namespace $NAMESPACE

rm tls.key tls.crt