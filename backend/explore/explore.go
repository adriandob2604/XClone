package explore

import (
	"backend/db"
	"backend/posts"
	"backend/users"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

func GetExploreSearches(c *gin.Context) {
	var foundUsers []users.UserData
	var foundPosts []posts.Post
	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	query := c.Query("q")
	ctx := c.Request.Context()
	usersCollection := db.Database.Collection("users")
	postsCollection := db.Database.Collection("posts")
	userCursor, err := usersCollection.Find(ctx, bson.M{"username": bson.M{"$regex": "^" + query, "$options": "i"}, "_id": bson.M{"$ne": decodedId}})
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	defer userCursor.Close(ctx)
	for userCursor.Next(ctx) {
		var foundUser users.UserData
		err := userCursor.Decode(&foundUser)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		foundUsers = append(foundUsers, foundUser)
	}
	postCursor, err := postsCollection.Find(ctx, bson.M{"text": bson.M{"$regex": "^" + query, "$options": "i"}})
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	defer postCursor.Close(ctx)
	for postCursor.Next(ctx) {
		var foundPost posts.Post
		err := postCursor.Decode(&foundPost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		foundPosts = append(foundPosts, foundPost)
	}
	if len(foundPosts) == 0 && len(foundUsers) == 0 {
		message := fmt.Sprintf("No results for: %s", query)
		c.JSON(http.StatusNotFound, gin.H{"message": message})
		return
	}
	c.JSON(http.StatusOK, gin.H{"users": foundUsers, "posts": foundPosts, "query": query})
}
