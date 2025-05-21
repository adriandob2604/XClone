package tags

import (
	"backend/db"
	"backend/posts"
	"net/http"
	"sort"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

type Tag struct {
	Tag   string       `json:"tag" bson:"tag"`
	Posts []posts.Post `json:"posts" bson:"posts"`
}

func TrendingTags(c *gin.Context) {
	var tags []Tag
	ctx := c.Request.Context()
	collection := db.Database.Collection("tags")
	cursor, err := collection.Find(ctx, bson.M{})
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
	sort.Slice(tags, func(i, j int) bool {
		return len(tags[i].Posts) > len(tags[j].Posts)
	})
	c.JSON(http.StatusOK, tags)

}
