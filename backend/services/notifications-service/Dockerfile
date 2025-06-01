FROM golang:1.22 as builder

WORKDIR /backend/services/notifications-services
COPY . .

RUN go build -o notifications-services main.go

FROM alpine:latest

WORKDIR /app

COPY --from=builder /backend/services/notifications-services/notifications-services .

EXPOSE 5000

CMD ["./notifications-services"]
