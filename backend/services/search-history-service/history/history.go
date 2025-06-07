package history

import (
	"net/http"

	"github.com/adriandob2604/XClone/backend/db"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type History struct {
	UserId   primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Searches []Search           `json:"searches" bson:"searches"`
}

type Search struct {
	SearchId primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Input    string             `json:"input" bson:"input"`
}
type SearchRequest struct {
	Input string `json:"input"`
}

func PostHistoryItem(c *gin.Context) {
	var historyItem Search
	var searchString SearchRequest
	var updatedHistory History
	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	if err := c.ShouldBindJSON(&searchString); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	historyItem.SearchId = primitive.NewObjectID()
	historyItem.Input = searchString.Input
	ctx := c.Request.Context()
	collection := db.Database.Collection("history")
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After).SetUpsert(true)
	update := bson.M{
		"$push": bson.M{"searches": historyItem},
	}

	err := collection.FindOneAndUpdate(
		ctx,
		bson.M{"_id": decodedId.(primitive.ObjectID)},
		update,
		opts,
	).Decode(&updatedHistory)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "History Item added!"})
}
func GetHistory(c *gin.Context) {
	var history History
	ctx := c.Request.Context()
	collection := db.Database.Collection("history")
	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	err := collection.FindOne(ctx, bson.M{"_id": decodedId}).Decode(&history)
	if err != nil {
		c.JSON(http.StatusNoContent, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, history.Searches)
}
func DeleteHistoryItem(c *gin.Context) {
	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	itemId := c.Param("id")
	itemObjectID, err := primitive.ObjectIDFromHex(itemId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item ID"})
		return
	}
	ctx := c.Request.Context()
	collection := db.Database.Collection("history")
	_, err = collection.UpdateOne(ctx, bson.M{"_id": decodedId}, bson.M{"$pull": bson.M{"searches": bson.M{"_id": itemObjectID}}})
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Successfully removed item"})
}
func DeleteHistory(c *gin.Context) {
	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	ctx := c.Request.Context()
	collection := db.Database.Collection("history")
	_, err := collection.UpdateOne(
		ctx,
		bson.M{"_id": decodedId},
		bson.M{"$set": bson.M{"searches": []Search{}}},
	)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "History deleted"})
}
