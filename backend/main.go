package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"os"
	"sort"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID              primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	BackgroundImage string             `json:"backgroundImageUrl" bson:"backgroundImageUrl"`
	ProfileImage    string             `json:"profileImageUrl" bson:"profileImageUrl"`
	Name            string             `json:"name" bson:"name"`
	Surname         string             `json:"surname" bson:"surname"`
	Username        string             `json:"username" bson:"username"`
	Password        string             `json:"password" bson:"password"`
	Email           string             `json:"email" bson:"email"`
	PhoneNumber     string             `json:"phoneNumber" bson:"phoneNumber"`
	CreatedOn       time.Time          `json:"createdOn" bson:"createdOn"`
	BirthDate       time.Time          `json:"birthDate" bson:"birthDate"`
	Followers       []Follower         `json:"followers" bson:"followers"`
	Following       []Follower         `json:"following" bson:"following"`
	Notifications   []Notification     `json:"notifications" bson:"notifications"`
	Chats           []Chat             `json:"chats" bson:"chats"`
}
type Follower struct {
	UserID   primitive.ObjectID `bson:"userId"`
	Username string             `json:"username" bson:"username"`
}
type FollowerData struct {
	Username string `json:"username" bson:"username"`
}
type Comment struct {
	CommentId primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Comment   string             `json:"comment" bson:"comment"`
	Likes     int64              `json:"likes" bson:"likes"`
	CreatedAt time.Time          `json:"createdAt" bson:"createdAt"`
}
type UserUpdateData struct {
	Username    string    `json:"username"`
	Password    string    `json:"password"`
	Name        string    `json:"name"`
	Surname     string    `json:"surname"`
	Email       string    `json:"email"`
	PhoneNumber string    `json:"phoneNumber" `
	BirthDate   time.Time `json:"birthDate" `
}
type UserData struct {
	BackgroundImage string     `json:"backgroundImageUrl" bson:"backgroundImageUrl"`
	ProfileImage    string     `json:"profileImageUrl" bson:"profileImageUrl"`
	Name            string     `json:"name" bson:"name"`
	Surname         string     `json:"surname" bson:"surname"`
	Username        string     `json:"username" bson:"username"`
	CreatedOn       time.Time  `json:"createdOn" bson:"createdOn"`
	Followers       []Follower `json:"followers" bson:"followers"`
	Following       []Follower `json:"following" bson:"following"`
}

type Post struct {
	ID        primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	UserID    primitive.ObjectID `json:"userId" bson:"userId"`
	Text      string             `json:"text" bson:"text"`
	File      string             `json:"fileUrl" bson:"fileUrl"`
	Comments  []Comment          `json:"comments" bson:"comments"`
	Tags      []string           `json:"tags" bson:"tags"`
	Likes     int64              `json:"likes" bson:"likes"`
	CreatedOn time.Time          `json:"createdOn" bson:"createdOn"`
}
type PostUpdateInput struct {
	Text string   `json:"text,omitempty"`
	Tags []string `json:"tags,omitempty"`
}
type Tag struct {
	Tag   string `json:"tag" bson:"tag"`
	Posts []Post `json:"posts" bson:"posts"`
}
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

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
type Notification struct {
	NotificationId primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Notification   time.Time          `json:"notification" bson:"notification"`
	CreatedOn      time.Time          `json:"createdOn" bson:"createdOn"`
}

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

var mongoClient *mongo.Client
var database *mongo.Database
var S3Client *s3.Client
var uploader *manager.Uploader
var downloader *manager.Downloader

func ConnectAWS() error {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return err
	}
	S3Client = s3.NewFromConfig(cfg)
	uploader = manager.NewUploader(S3Client)
	downloader = manager.NewDownloader(S3Client)
	return nil
}
func UploadFile(bucket, key string, file io.Reader) error {
	_, err := uploader.Upload(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
		Body:   file,
	})
	if err != nil {
		return err
	}
	return nil
}
func DownloadFile(bucket, key string) ([]byte, error) {
	buffer := manager.NewWriteAtBuffer([]byte{})
	_, err := downloader.Download(context.TODO(), buffer, &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to download file: %w", err)
	}

	return buffer.Bytes(), nil
}
func connect() error {
	ctx, cancel := context.WithTimeout(context.Background(), 40*time.Second)
	defer cancel()
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Couldn't load env files")
	}
	URIPass := os.Getenv("MONGODB_PASSWORD")
	USER := os.Getenv("USERNAME")
	URI := "mongodb+srv://" + USER + ":" + URIPass + "@cluster0.xfeii4f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(URI).SetConnectTimeout(5*time.Second))
	if err != nil {
		return err
	}
	mongoClient = client
	database = client.Database("db")
	return nil
}
func CORS() cors.Config {
	url := "http://localhost:3000"
	config := cors.Config{
		AllowOrigins:     []string{url},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	return config
}
func HashPassword(password string) string {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil {
		log.Fatal(err)
		return ""
	}
	return string(bytes)
}
func VerifyPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
func GetUser(c *gin.Context) {
	ctx := c.Request.Context()
	var foundUser UserData
	username := c.Param("username")
	collection := database.Collection("users")

	err := collection.FindOne(ctx, bson.M{"username": username}).Decode(&foundUser)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, foundUser)
}
func GetSessionUser(c *gin.Context) {
	ctx := c.Request.Context()
	var foundUser User
	collection := database.Collection("users")
	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	err := collection.FindOne(ctx, bson.M{"_id": decodedId}).Decode(&foundUser)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"id": decodedId, "username": foundUser.Username, "name": foundUser.Name, "surname": foundUser.Surname, "createdOn": foundUser.CreatedOn})
}
func CreateUser(c *gin.Context) {
	var newUser User
	newUser.ID = primitive.NewObjectID()
	if err := c.ShouldBindJSON(&newUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	newUser.Password = HashPassword(newUser.Password)
	ctx := c.Request.Context()
	collection := database.Collection("users")
	_, err := collection.InsertOne(ctx, newUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User created"})
}

func UpdateUser(c *gin.Context) {
	var updatedUser User
	var updateData UserUpdateData
	var foundUser User
	ctx := c.Request.Context()

	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	collection := database.Collection("users")
	err := collection.FindOne(ctx, bson.M{"_id": decodedId}).Decode(&foundUser)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	updateFields := bson.M{}
	if updateData.Name != "" {
		updateFields["name"] = updateData.Name
	}
	if updateData.Surname != "" {
		updateFields["surname"] = updateData.Surname
	}
	if updateData.Email != "" {
		updateFields["email"] = updateData.Email
	}
	if updateData.PhoneNumber != "" {
		updateFields["phoneNumber"] = updateData.PhoneNumber
	}
	if !updateData.BirthDate.IsZero() {
		updateFields["birthDate"] = updateData.BirthDate
	}
	err = collection.FindOneAndUpdate(ctx, bson.M{"_id": decodedId}, bson.M{"$set": updateFields}, options.FindOneAndUpdate().SetReturnDocument(options.After)).Decode(&updatedUser)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, updatedUser)
}
func DeleteUser(c *gin.Context) {
	var deletedUser User
	var user User
	var foundUser User

	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	ctx := c.Request.Context()
	collection := database.Collection("users")

	err := collection.FindOne(ctx, bson.M{"_id": decodedId}).Decode(&foundUser)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	err = collection.FindOneAndDelete(ctx, bson.M{"_id": decodedId}).Decode(&deletedUser)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Account deleted"})
}

func CreatePost(c *gin.Context) {
	var post Post
	post.ID = primitive.NewObjectID()

	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	post.UserID = decodedId.(primitive.ObjectID)
	post.CreatedOn = time.Now()
	ctx := c.Request.Context()
	collection := database.Collection("posts")

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
	ctx := c.Request.Context()
	collection := database.Collection("posts")
	postId, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	err = collection.FindOne(ctx, bson.M{"_id": postId}).Decode(&foundPost)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
	}
	c.JSON(http.StatusOK, foundPost)
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
	posts := database.Collection("posts")
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
	posts := database.Collection("posts")

	err = posts.FindOneAndDelete(ctx, bson.M{"_id": postId, "userId": decodedId}).Decode(&deletedPost)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Post successfully deleted", "deletedPost": deletedPost.ID})
}

func GetPosts(c *gin.Context) {
	var foundPosts []Post
	ctx := c.Request.Context()
	collection := database.Collection("posts")
	username := c.Param("username")
	cursor, err := collection.Find(ctx, bson.M{"username": username})
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
	c.JSON(http.StatusOK, gin.H{"posts": foundPosts, "postCount": len(foundPosts)})
}
func FollowUser(c *gin.Context) {
	var foundUser User
	var follower Follower
	var username FollowerData
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
	collection := database.Collection("users")
	err := collection.FindOne(ctx, bson.M{"username": username.Username}).Decode(&foundUser)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	follower.UserID = foundUser.ID
	follower.Username = foundUser.Username

	update := bson.M{
		"$setOnInsert": bson.M{
			"following": []Follower{},
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
	collection := database.Collection("users")
	username := c.Param("username")

	result := collection.FindOneAndUpdate(ctx, bson.M{"_id": decodedId}, bson.M{"$pull": bson.M{"following": bson.M{"username": username}}})
	if result.Err() != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Err().Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Successfully unfollowed user"})
}
func GetFollowingPosts(c *gin.Context) {
	var foundUser User
	var foundPosts []Post
	ctx := c.Request.Context()
	users := database.Collection("users")
	posts := database.Collection("posts")
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
	posts := database.Collection("posts")
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
	collection := database.Collection("posts")
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

func TrendingTags(c *gin.Context) {
	var tags []Tag
	ctx := c.Request.Context()
	collection := database.Collection("tags")
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
func ToFollow(c *gin.Context) {
	var users []UserData
	var usersToFollow []UserData
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	ctx := c.Request.Context()
	collection := database.Collection("users")
	cursor, err := collection.Find(ctx, bson.M{"_id": bson.M{"$ne": userId}})
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(ctx)
	for cursor.Next(ctx) {
		var currentUser UserData
		err := cursor.Decode(&currentUser)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		users = append(users, currentUser)
	}
	for i := 0; i < len(users); i++ {
		if len(usersToFollow) == 3 {
			break
		}
		usersToFollow = append(usersToFollow, users[rand.Intn(len(users))])
	}
	if len(usersToFollow) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No users to follow!"})
		return
	}
	c.JSON(http.StatusOK, usersToFollow)
}
func Followers(c *gin.Context) {
	var user User
	_, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	username := c.Param("username")
	ctx := c.Request.Context()
	collection := database.Collection("users")
	err := collection.FindOne(ctx, bson.M{"username": username}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"followers": user.Followers})

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
	collection := database.Collection("history")
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
	collection := database.Collection("history")
	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	err := collection.FindOne(ctx, bson.M{"_id": decodedId}).Decode(&history)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
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
	ctx := c.Request.Context()
	collection := database.Collection("history")
	_, err := collection.UpdateOne(ctx, bson.M{"_id": decodedId}, bson.M{"$pull": bson.M{"searches": bson.M{"_id": itemId}}})
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
	collection := database.Collection("history")
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
func GetNotifications(c *gin.Context) {
	var notifications []Notification
	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	ctx := c.Request.Context()
	collection := database.Collection("notifications")
	err := collection.FindOne(ctx, bson.M{"_id": decodedId}).Decode(&notifications)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, notifications)
}
func PostNotification(c *gin.Context) {
	var foundUser User
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
	collection := database.Collection("users")
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
func GetChat(c *gin.Context) {
	var foundChat Chat
	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	chatId := c.Param("id")
	ctx := c.Request.Context()
	collection := database.Collection("chats")
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
	collection := database.Collection("messages")
	err := collection.FindOneAndUpdate(ctx, bson.M{"_id": messageToUpdate.MessageId, "userId": decodedId}, bson.M{"$set": bson.M{"message": messageToUpdate.Message, "updatedAt": time.Now()}})
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Err()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Successfully updated message!"})
}
func GetToken(c *gin.Context) (string, error) {
	header := c.GetHeader("Authorization")
	if header == "" {
		return "", fmt.Errorf("Header is missing")
	}
	tokenParts := strings.SplitN(header, " ", 2)
	if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
		return "", fmt.Errorf("Invalid header")
	}
	token := tokenParts[1]
	return token, nil
}
func GenerateJWT(userId primitive.ObjectID) (string, error) {
	key := []byte(os.Getenv("SECRET"))
	t := jwt.NewWithClaims(jwt.SigningMethodHS256,
		jwt.MapClaims{
			"userId": userId.Hex(),
			"exp":    time.Now().Add(time.Hour * 24).Unix(),
		},
	)

	s, err := t.SignedString(key)
	if err != nil {
		return "", err
	}

	return s, nil
}
func VerifyJWT(tokenString string) (*jwt.Token, error) {
	var key = []byte(os.Getenv("SECRET"))
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		return key, nil
	})
	if err != nil {
		return nil, err
	}
	if !token.Valid {
		return nil, fmt.Errorf("Token is invalid")
	}
	return token, nil
}
func DecodeJWT(tokenString string) (primitive.ObjectID, error) {
	token, err := VerifyJWT(tokenString)
	if err != nil {
		return primitive.NilObjectID, fmt.Errorf("Couldn't verify token")
	}
	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		idStr, ok := claims["userId"].(string)
		if !ok {
			return primitive.NilObjectID, fmt.Errorf("Couldn't verify id")
		}
		id, err := primitive.ObjectIDFromHex(idStr)
		if err != nil {
			return primitive.NilObjectID, err
		}
		return id, nil
	}
	return primitive.NilObjectID, fmt.Errorf("Token doesn't match")
}
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := GetToken(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}
		decodedId, err := DecodeJWT(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}
		c.Set("userId", decodedId)
		c.Next()
	}
}
func Login(c *gin.Context) {
	var loginInfo LoginRequest
	var foundUser User
	if err := c.ShouldBindJSON(&loginInfo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user info"})
		return
	}
	ctx := c.Request.Context()
	collection := database.Collection("users")
	err := collection.FindOne(ctx, bson.M{"username": loginInfo.Username}).Decode(&foundUser)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	if !VerifyPassword(loginInfo.Password, foundUser.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Wrong username or password"})
		return
	}

	token, err := GenerateJWT(foundUser.ID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Successfully logged in!", "token": token})
}
func Logout(c *gin.Context) {
	ctx := c.Request.Context()
	blacklist := database.Collection("blacklist")
	token, err := GetToken(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Already logged out"})
		return
	}
	var existingToken bson.M
	err = blacklist.FindOne(ctx, bson.M{"token": token}).Decode(&existingToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Already logged out"})
		return
	}
	_, err = blacklist.InsertOne(ctx, token)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Successfully logged out"})
}
func init() {
	if err := connect(); err != nil {
		log.Fatal("Couldn't connect to database")
	}
	if err := ConnectAWS(); err != nil {
		log.Fatal("Couldn't connect to aws")
	}
}
func main() {
	gin.SetMode(gin.DebugMode)
	router := gin.Default()
	router.Use(cors.New(CORS()))
	router.POST("/users", CreateUser)
	router.GET("/users/:username", GetUser)
	router.PUT("/users", AuthMiddleware(), UpdateUser)
	router.DELETE("/users", AuthMiddleware(), DeleteUser)
	router.GET("/to_follow", AuthMiddleware(), ToFollow)
	router.POST("/login", Login)
	router.GET("/posts/:id", GetPost)
	router.GET("/:username/posts", GetPosts)
	router.POST("/posts", AuthMiddleware(), CreatePost)
	router.PUT("/posts/:postId", AuthMiddleware(), UpdatePost)
	router.DELETE("/posts/:postId", AuthMiddleware(), DeletePost)
	router.GET("/trending", TrendingTags)
	router.GET("/me", AuthMiddleware(), GetSessionUser)
	router.GET("/for_you_posts", AuthMiddleware(), GetForYouPosts)
	router.GET("/following_posts", AuthMiddleware(), GetFollowingPosts)
	router.GET("/history", AuthMiddleware(), GetHistory)
	router.POST("/history", AuthMiddleware(), PostHistoryItem)
	router.DELETE("/history/:id", AuthMiddleware(), DeleteHistoryItem)
	router.DELETE("/history", AuthMiddleware(), DeleteHistory)
	router.POST("/followers", AuthMiddleware(), FollowUser)
	router.DELETE("/followers/:username", AuthMiddleware(), UnfollowUser)
	router.GET("/:username/followers", AuthMiddleware(), Followers)
	router.GET("/notifications", AuthMiddleware(), GetNotifications)
	router.POST("/notifications", AuthMiddleware(), PostNotification)
	router.Run(":5000")
}
