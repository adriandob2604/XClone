FROM golang:1.24-alpine AS builder

WORKDIR /backend

COPY go.sum go.mod . 
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o bin/explore-services /backend/services/explore-service/main.go
RUN CGO_ENABLED=0 GOOS=linux go build -o bin/interaction-services /backend/services/interaction-service/main.go
RUN CGO_ENABLED=0 GOOS=linux go build -o bin/notifications-services /backend/services/notifications-service/main.go
RUN CGO_ENABLED=0 GOOS=linux go build -o bin/post-services /backend/services/post-service/main.go
RUN CGO_ENABLED=0 GOOS=linux go build -o bin/search-history-services /backend/services/search-history-service/main.go
RUN CGO_ENABLED=0 GOOS=linux go build -o bin/tags-services /backend/services/tags-service/main.go
RUN CGO_ENABLED=0 GOOS=linux go build -o bin/users-services /backend/services/users-service/main.go

FROM alpine:latest

WORKDIR /root/

COPY --from=builder /backend/bin/ .

EXPOSE 5000