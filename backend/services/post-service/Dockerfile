FROM golang:1.22 as builder

WORKDIR /backend/services/post-service
COPY . .

RUN go build -o post-service main.go

FROM alpine:latest

WORKDIR /app

COPY --from=builder /backend/services/post-service/post-service .

EXPOSE 5000

CMD ["./post-service"]
