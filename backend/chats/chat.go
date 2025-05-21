package chats

import (
	"backend/db"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Chat struct {
	ChatId   primitive.ObjectID    `json:"id,omitempty" bson:"_id,omitempty"`
	UserIds  [2]primitive.ObjectID `json:"userIds" bson:"userIds"`
	Messages []Message             `json:"messages" bson:"messages"`
}
type Message struct {
	MessageId primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	UserId    primitive.ObjectID `json:"userId" bson:"userId"`
	Message   string             `json:"message" bson:"message"`
	CreatedOn time.Time          `json:"createdOn" bson:"createdOn"`
	UpdatedAt time.Time          `json:"updatedAt" bson:"updatedAt"`
}

func PostChatMessage(c *gin.Context) {
	var message Message
	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	if err := c.ShouldBindJSON(&message); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	message.MessageId = primitive.NewObjectID()
	message.UserId = decodedId.(primitive.ObjectID)
	message.CreatedOn = time.Now()
	message.UpdatedAt = time.Now()
	ctx := c.Request.Context()
	collection := db.Database.Collection("messages")
	_, err := collection.InsertOne(ctx, message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Successfully posted"})

}
func GetChatMessages(c *gin.Context) {
	var foundChat Chat
	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	chatId := c.Param("id")
	ctx := c.Request.Context()
	collection := db.Database.Collection("chats")
	err := collection.FindOne(ctx, bson.M{"_id": chatId, "userIds": decodedId}).Decode(&foundChat)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, foundChat.Messages)
}
func UpdateChatMessage(c *gin.Context) {
	var messageToUpdate Message
	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	if err := c.ShouldBindJSON(&messageToUpdate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	ctx := c.Request.Context()
	collection := db.Database.Collection("messages")
	res := collection.FindOneAndUpdate(ctx, bson.M{"_id": messageToUpdate.MessageId, "userId": decodedId}, bson.M{"$set": bson.M{"message": messageToUpdate.Message, "updatedAt": time.Now()}})
	if res.Err() != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": res.Err().Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Successfully updated message!"})
}
func DeleteChatMessage(c *gin.Context) {
	decodedId, exists := c.Get("id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	messageId, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	ctx := c.Request.Context()
	collection := db.Database.Collection("messages")
	res := collection.FindOneAndDelete(ctx, bson.M{"_id": messageId, "userId": decodedId})
	if res.Err() != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": res.Err().Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Message Successfully deleted"})
}
