FROM golang:1.22 as builder

WORKDIR /backend/services/tags-service
COPY . .

RUN go build -o tags-service main.go

FROM alpine:latest

WORKDIR /app

COPY --from=builder /backend/services/tags-service/tags-service .

EXPOSE 5000

CMD ["./tags-service"]
