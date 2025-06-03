package notifications

import (
	"net/http"
	"time"

	"github.com/adriandob2604/XClone/backend/db"
	"github.com/adriandob2604/XClone/backend/services/users-service/users"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Notification struct {
	NotificationId primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Notification   time.Time          `json:"notification" bson:"notification"`
	CreatedOn      time.Time          `json:"createdOn" bson:"createdOn"`
}

func GetNotifications(c *gin.Context) {
	var notifications []Notification
	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	ctx := c.Request.Context()
	collection := db.Database.Collection("notifications")
	err := collection.FindOne(ctx, bson.M{"_id": decodedId}).Decode(&notifications)
	if err != nil {
		c.JSON(http.StatusOK, []Notification{})
		return
	}
	c.JSON(http.StatusOK, notifications)
}
func PostNotification(c *gin.Context) {
	var foundUser users.User
	var notification Notification
	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	if err := c.ShouldBindJSON(&notification); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := c.Request.Context()
	collection := db.Database.Collection("users")
	err := collection.FindOne(ctx, bson.M{"_id": decodedId}).Decode(&foundUser)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	notification.NotificationId = primitive.NewObjectID()
	notification.CreatedOn = time.Now()
	for _, follower := range foundUser.Followers {
		result := collection.FindOneAndUpdate(ctx, bson.M{"_id": follower.UserID}, bson.M{"$push": bson.M{"notifications": notification}})
		if result.Err() != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Err().Error()})
			return
		}
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Successfully sent a notifications"})
}
