FROM golang:1.22 as builder

WORKDIR /backend/services/search-history-services
COPY . .

RUN go build -o search-history-services main.go

FROM alpine:latest

WORKDIR /app

COPY --from=builder /backend/services/search-history-services/search-history-services .

EXPOSE 5000

CMD ["./search-history-services"]
