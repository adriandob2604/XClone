package followers

import (
	"backend/db"
	"backend/users"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func FollowUser(c *gin.Context) {
	var foundUser users.User
	var follower users.Follower
	var username users.FollowerData
	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	if err := c.ShouldBindJSON(&username); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	ctx := c.Request.Context()
	collection := db.Database.Collection("users")
	err := collection.FindOne(ctx, bson.M{"username": username.Username}).Decode(&foundUser)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	follower.UserID = foundUser.ID
	follower.Username = foundUser.Username

	update := bson.M{
		"$setOnInsert": bson.M{
			"following": []users.Follower{},
		},
		"$addToSet": bson.M{
			"following": follower,
		},
	}

	updateOptions := options.FindOneAndUpdate().SetUpsert(true)

	result := collection.FindOneAndUpdate(
		ctx,
		bson.M{"_id": decodedId},
		update,
		updateOptions,
	)
	if result.Err() != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Err().Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "New follower added"})
}
func UnfollowUser(c *gin.Context) {
	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	ctx := c.Request.Context()
	collection := db.Database.Collection("users")
	username := c.Param("username")

	result := collection.FindOneAndUpdate(ctx, bson.M{"_id": decodedId}, bson.M{"$pull": bson.M{"following": bson.M{"username": username}}})
	if result.Err() != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Err().Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Successfully unfollowed user"})
}

func Followers(c *gin.Context) {
	var user users.User
	_, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	username := c.Param("username")
	ctx := c.Request.Context()
	collection := db.Database.Collection("users")
	err := collection.FindOne(ctx, bson.M{"username": username}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"followers": user.Followers})

}
