FROM golang:1.24 AS builder

WORKDIR /backend

COPY go.sum go.mod .

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o backend .

FROM alpine:latest

WORKDIR /root/

COPY --from=builder /backend/backend .

EXPOSE 5000

CMD ["./backend"]

