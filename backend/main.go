package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"sort"
	"strings"
	"time"

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

var mongoClient *mongo.Client
var database *mongo.Database
var currentDate = time.Now()
var timeFormat = currentDate.Format("2006-01-02")

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
	c.JSON(http.StatusOK, gin.H{"username": foundUser.Username, "name": foundUser.Name, "surname": foundUser.Surname, "createdOn": foundUser.CreatedOn})
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
	follower.FollowerID = primitive.NewObjectID()
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
		cursor, err := posts.Find(ctx, bson.M{"userId": userId, "createdOn": currentDate.Format("2006-01-02")})
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
	cursor, err := posts.Find(ctx, bson.M{"createdOn": timeFormat})
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
	notification.CreatedOn = timeFormat
	for _, follower := range foundUser.Followers {
		result := collection.FindOneAndUpdate(ctx, bson.M{"_id": follower.UserID}, bson.M{"$push": bson.M{"notifications": notification}})
		if result.Err() != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Err().Error()})
			return
		}
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Successfully sent a notifications"})
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
	router.Run(":5000")
}
