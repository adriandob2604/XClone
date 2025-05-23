package followers

import (
	"backend/db"
	"backend/users"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type FollowerId struct {
	ID primitive.ObjectID `json:"id" bson:"_id"`
}

func FollowUser(c *gin.Context) {
	var foundUser users.UserData
	var follower users.Follower
	var userId FollowerId
	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	if err := c.ShouldBindJSON(&userId); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if decodedId == userId.ID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "You cannot follow yourself"})
		return
	}
	ctx := c.Request.Context()
	collection := db.Database.Collection("users")
	err := collection.FindOne(ctx, bson.M{"_id": userId.ID}).Decode(&foundUser)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	follower.UserID = userId.ID
	follower.Username = foundUser.Username

	update := bson.M{
		"$addToSet": bson.M{
			"following": follower,
		},
	}

	result := collection.FindOneAndUpdate(
		ctx,
		bson.M{"_id": decodedId},
		update,
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
	userId := c.Param("userId")
	ctx := c.Request.Context()
	collection := db.Database.Collection("users")

	result := collection.FindOneAndUpdate(ctx, bson.M{"_id": decodedId}, bson.M{"$pull": bson.M{"following": bson.M{"userId": userId}}})
	if result.Err() != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Err().Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Successfully unfollowed user"})
}

func Followers(c *gin.Context) {
	var user users.UserData
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
