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
	NotificationID primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	UserID         string             `json:"userId" bson:"userId"`
	Notification   string             `json:"notification" bson:"notification"`
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
		c.JSON(http.StatusNoContent, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, notifications)
}
func PostNotification(c *gin.Context) {
	var foundUser users.UserData
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
	notifications := db.Database.Collection("notifications")
	users := db.Database.Collection("users")
	err := users.FindOne(ctx, bson.M{"_id": decodedId}).Decode(&foundUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	notification.NotificationID = primitive.NewObjectID()
	notification.CreatedOn = time.Now()
	if len(foundUser.Followers) == 0 {
		c.JSON(http.StatusNoContent, gin.H{"message": "No followers yet!"})
		return
	}
	for _, follower := range foundUser.Followers {
		notification := Notification{
			NotificationID: primitive.NewObjectID(),
			UserID:         follower.UserID,
			Notification:   notification.Notification,
			CreatedOn:      time.Now(),
		}
		_, err := notifications.InsertOne(ctx, notification)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Successfully sent a notifications"})
}
