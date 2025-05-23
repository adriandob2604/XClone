package posts

import (
	"backend/db"
	"backend/users"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Post struct {
	PostID    primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	UserID    primitive.ObjectID `json:"userId" bson:"userId"`
	Text      string             `json:"text" bson:"text"`
	FileUrl   string             `json:"fileUrl" bson:"fileUrl"`
	Comments  []Comment          `json:"comments" bson:"comments"`
	Tags      []string           `json:"tags" bson:"tags"`
	Likes     int64              `json:"likes" bson:"likes"`
	CreatedOn time.Time          `json:"createdOn" bson:"createdOn"`
	UpdatedAt time.Time          `json:"updatedAt" bson:"updatedAt"`
}
type PostUpdateInput struct {
	Text string   `json:"text,omitempty"`
	Tags []string `json:"tags,omitempty"`
}

type Comment struct {
	CommentId primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	UserId    primitive.ObjectID `json:"userId" bson:"userId"`
	Comment   string             `json:"comment" bson:"comment"`
	Likes     int64              `json:"likes" bson:"likes"`
	CreatedAt time.Time          `json:"createdAt" bson:"createdAt"`
}

func CreatePost(c *gin.Context) {
	var post Post
	post.PostID = primitive.NewObjectID()

	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	post.UserID = decodedId.(primitive.ObjectID)
	post.CreatedOn = time.Now()
	ctx := c.Request.Context()
	collection := db.Database.Collection("posts")

	if err := c.ShouldBindJSON(&post); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := collection.InsertOne(ctx, post)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, post)
}
func GetPost(c *gin.Context) {
	var foundPost Post
	var foundUser users.UserData
	ctx := c.Request.Context()
	posts := db.Database.Collection("posts")
	users := db.Database.Collection("users")
	postId, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	err = posts.FindOne(ctx, bson.M{"_id": postId}).Decode(&foundPost)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
		return
	}
	err = users.FindOne(ctx, bson.M{"_id": foundPost.UserID}).Decode(&foundUser)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"post": foundPost, "user": foundUser})
}
func UpdatePost(c *gin.Context) {
	var updateData PostUpdateInput
	var updatedPost Post

	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	ctx := c.Request.Context()
	posts := db.Database.Collection("posts")
	postId, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	update := bson.M{}
	if updateData.Text != "" {
		update["text"] = updateData.Text
	}
	if updateData.Tags != nil {
		update["tags"] = updateData.Tags
	}
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	err = posts.FindOneAndUpdate(ctx, bson.M{"_id": postId, "userId": decodedId}, bson.M{"$set": update}, opts).Decode(&updatedPost)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, updatedPost)
}
func DeletePost(c *gin.Context) {
	var deletedPost Post
	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	ctx := c.Request.Context()
	postId, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	posts := db.Database.Collection("posts")

	err = posts.FindOneAndDelete(ctx, bson.M{"_id": postId, "userId": decodedId}).Decode(&deletedPost)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error(), "isOwn": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Post successfully deleted", "isOwn": true})
}

func GetPosts(c *gin.Context) {
	var foundPosts []Post
	var foundUser users.UserData
	ctx := c.Request.Context()
	users := db.Database.Collection("users")
	username := c.Param("username")
	err := users.FindOne(ctx, bson.M{"username": username}).Decode(&foundUser)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	posts := db.Database.Collection("posts")
	cursor, err := posts.Find(ctx, bson.M{"username": username})
	if err != nil {
		c.JSON(http.StatusNoContent, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(ctx)
	for cursor.Next(ctx) {
		var currentPost Post
		err := cursor.Decode(&currentPost)
		if err != nil {
			c.JSON(http.StatusNoContent, gin.H{"error": err.Error()})
			return
		}
		foundPosts = append(foundPosts, currentPost)
	}

	c.JSON(http.StatusOK, gin.H{"posts": foundPosts, "user": foundUser})
}
func GetFollowingPosts(c *gin.Context) {
	var foundUser users.User
	var foundPosts []Post
	ctx := c.Request.Context()
	users := db.Database.Collection("users")
	posts := db.Database.Collection("posts")
	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	err := users.FindOne(ctx, bson.M{"_id": decodedId}).Decode(&foundUser)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	for _, userId := range foundUser.Following {
		cursor, err := posts.Find(ctx, bson.M{"userId": userId, "createdOn": time.Now()})
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		defer cursor.Close(ctx)
		for cursor.Next(ctx) {
			var foundPost Post

			err := cursor.Decode(&foundPost)
			if err != nil {
				c.JSON(http.StatusNoContent, gin.H{"error": err.Error()})
				return
			}
			foundPosts = append(foundPosts, foundPost)
		}
	}
	if len(foundPosts) == 0 {
		c.JSON(http.StatusNoContent, gin.H{"message": "No posts from followed users today"})
		return
	}
	c.JSON(http.StatusOK, foundPosts)
}
func GetForYouPosts(c *gin.Context) {
	var foundPosts []Post
	ctx := c.Request.Context()
	posts := db.Database.Collection("posts")
	cursor, err := posts.Find(ctx, bson.M{"createdOn": time.Now()})
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(ctx)
	for cursor.Next(ctx) {
		var foundPost Post
		err := cursor.Decode(&foundPost)
		if err != nil {
			c.JSON(http.StatusNoContent, gin.H{"error": err.Error()})
			return
		}
		foundPosts = append(foundPosts, foundPost)
	}
	if len(foundPosts) == 0 {
		c.JSON(http.StatusNoContent, gin.H{"message": "No posts were posted today!"})
		return
	}
	c.JSON(http.StatusOK, foundPosts)
}

func FindPostsWithTag(c *gin.Context) {
	var posts []Post
	tagName := c.Param("tag")
	ctx := c.Request.Context()
	collection := db.Database.Collection("posts")
	cursor, err := collection.Find(ctx, bson.M{"tags": tagName})
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
	}
	defer cursor.Close(ctx)
	for cursor.Next(ctx) {
		var currentPost Post
		err := cursor.Decode(&currentPost)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		}
		posts = append(posts, currentPost)
	}
	c.JSON(http.StatusOK, posts)
}
