FROM golang:1.22 as builder

WORKDIR /backend/services/interaction-services
COPY . .

RUN go build -o interaction-services main.go

FROM alpine:latest

WORKDIR /app

COPY --from=builder /backend/services/interaction-services/interaction-services .

EXPOSE 5000

CMD ["./interaction-services"]
