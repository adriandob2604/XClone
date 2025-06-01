FROM golang:1.22 as builder

WORKDIR /backend/services/users-service
COPY . .

RUN go build -o users-service main.go

FROM alpine:latest

WORKDIR /app

COPY --from=builder /backend/services/users-service/users-service .

EXPOSE 5000

CMD ["./users-service"]
