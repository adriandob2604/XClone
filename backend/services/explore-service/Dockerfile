FROM golang:1.22 as builder

WORKDIR /backend/services/explore-service
COPY . .

RUN go build -o explore-service main.go

FROM alpine:latest

WORKDIR /app

COPY --from=builder /backend/services/explore-service/explore-service .

EXPOSE 5000

CMD ["./explore-service"]
