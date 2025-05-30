package db

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var mongoClient *mongo.Client
var Database *mongo.Database

func Connect() error {
	ctx, cancel := context.WithTimeout(context.Background(), 40*time.Second)
	defer cancel()
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Couldn't load env files")
	}
	URIPass := os.Getenv("MONGODB_PASSWORD")
	USER := os.Getenv("USERNAME")
	URI := "mongodb+srv://" + USER + ":" + URIPass + "@cluster0.xfeii4f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(URI).SetConnectTimeout(5*time.Second))
	if err != nil {
		return err
	}
	mongoClient = client
	Database = client.Database("db")
	return nil
}
