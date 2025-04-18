package main

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type User struct {
	ID          string    `bson:"id"`
	Name        string    `bson:"name"`
	Surname     string    `bson:"surname"`
	Username    string    `bson:"username"`
	Email       string    `bson:"email"`
	PhoneNumber string    `bson:"phoneNumber"`
	Month       string    `bson:"month"`
	Day         int64     `bson:"day"`
	Year        int64     `bson:"year"`
	CreatedOn   time.Time `bson:"createdOn"`
}
type Database struct {
	db *mongo.Database
}

func connect() (*mongo.Database, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	URL := "mongodb://localhost:27017/db"
	defer cancel()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(URL))
	if err != nil {
		return nil, err
	}
	return client.Database(URL), nil
}

func (handler *Database) GetUser(c *gin.Context) {
	var user User
	users := handler.db.Collection("users")

}
