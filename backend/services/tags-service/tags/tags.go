package tags

import (
	"net/http"
	"sort"

	"github.com/adriandob2604/XClone/backend/db"
	"github.com/adriandob2604/XClone/backend/services/post-service/posts"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Tag struct {
	Tag   string       `json:"tag" bson:"tag"`
	Posts []posts.Post `json:"posts" bson:"posts"`
}

func TrendingTags(c *gin.Context) {
	var tags []Tag
	var limit int64 = 5
	ctx := c.Request.Context()
	collection := db.Database.Collection("tags")
	findOptions := options.Find()
	findOptions.SetLimit(limit)
	cursor, err := collection.Find(ctx, bson.M{}, findOptions)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
	}
	defer cursor.Close(ctx)
	for cursor.Next(ctx) {
		var currentTag Tag
		err := cursor.Decode(&currentTag)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		}
		tags = append(tags, currentTag)
	}
	if len(tags) == 0 {
		c.JSON(http.StatusNoContent, gin.H{"message": "No tags were found"})
		return
	}
	sort.Slice(tags, func(i, j int) bool {
		return len(tags[i].Posts) > len(tags[j].Posts)
	})
	c.JSON(http.StatusOK, tags)

}
