package explore

import (
	"backend/db"
	"backend/posts"
	"backend/users"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

func GetExploreSearches(c *gin.Context) {
	var foundUsers []users.UserData
	var foundPosts []posts.Post
	_, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	query := c.Query("q")
	ctx := c.Request.Context()
	users := db.Database.Collection("users")
	posts := db.Database.Collection("posts")
	cursor, err := users.Find(ctx, bson.M{"username": bson.M{"$regex": query}})
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(ctx)
	for cursor.Next(ctx) {
		var foundUser users.UserData
		err := cursor.Decode(&foundUser)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		foundUsers = append(foundUsers, foundUser)
	}
	cursor, err = posts.Find(ctx, bson.M{"text": bson.M{"$regex": query}})
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(ctx)
	for cursor.Next(ctx) {
		var foundPost posts.Post
		err := cursor.Decode(&foundPost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		foundPosts = append(foundUsers, foundPost)
	}
}
