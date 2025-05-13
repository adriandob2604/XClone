package main

import (
	"context"
	"fmt"
	"log"
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

type User struct {
	ID          primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Name        string             `json:"name" bson:"name"`
	Surname     string             `json:"surname" bson:"surname"`
	Username    string             `json:"username" bson:"username"`
	Password    string             `json:"password" bson:"password"`
	Email       string             `json:"email" bson:"email"`
	PhoneNumber string             `json:"phoneNumber" bson:"phoneNumber"`
	CreatedOn   time.Time          `json:"createdOn" bson:"createdOn"`
	BirthDate   time.Time          `json:"birthDate" bson:"birthDate"`
	Followers   []Follower         `json:"followers" bson:"followers"`
	Following   []Follower         `json:"following" bson:"following"`
}
type Follower struct {
	FollowerID primitive.ObjectID `json:"followerId" bson:"followerId"`
}
type Comment struct {
	ID        primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	UserID    primitive.ObjectID `json:"userId" bson:"userId"`
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
	Name      string    `json:"name" bson:"name"`
	Surname   string    `json:"surname" bson:"surname"`
	Username  string    `json:"username" bson:"username"`
	CreatedOn time.Time `json:"createdOn" bson:"createdOn"`
}

type Post struct {
	ID        primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	UserID    primitive.ObjectID `json:"userId" bson:"userId"`
	Text      string             `json:"text" bson:"text"`
	File      http.File          `json:"file" bson:"file"`
	Comments  []Comment          `json:"comments" bson:"comments"`
	Tags      []string           `json:"tags" bson:"tags"`
	Likes     int64              `json:"likes" bson:"likes"`
	CreatedOn string             `json:"createdOn" bson:"createdOn"`
}
type PostUpdateInput struct {
	Text string   `json:"text,omitempty"`
	Tags []string `json:"tags,omitempty"`
}
type Tag struct {
	Posts []Post `json:"posts" bson:"posts"`
	Tag   string `json:"tag" bson:"tag"`
}
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

var mongoClient *mongo.Client
var database *mongo.Database
var key = []byte(os.Getenv("SECRET"))

func connect() error {
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	err := godotenv.Load()
	defer cancel()
	if err != nil {
		log.Fatal("Couldn't load env files")
	}
	URIPass := os.Getenv("MONGODB_PASSWORD")
	USER := os.Getenv("USERNAME")
	URI := "mongodb+srv://" + USER + ":" + URIPass + "@cluster0.xfeii4f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(URI))
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
	var foundUser User
	username := c.Param("username")
	collection := database.Collection("users")

	err := collection.FindOne(ctx, bson.M{"username": username}).Decode(&foundUser)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err})
		return
	}

	c.JSON(http.StatusOK, UserData{
		Name:      foundUser.Name,
		Surname:   foundUser.Surname,
		Username:  foundUser.Username,
		CreatedOn: foundUser.CreatedOn,
	})
}
func GetSessionUser(c *gin.Context) {
	ctx := c.Request.Context()
	var foundUser User
	collection := database.Collection("users")
	token, err := GetToken(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err})
		return
	}
	decodedUsername, err := DecodeJWT(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err})
		return
	}
	err = collection.FindOne(ctx, bson.M{"username": decodedUsername}).Decode(&foundUser)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err})
		return
	}
	c.JSON(http.StatusOK, gin.H{"username": foundUser.Username, "name": foundUser.Name, "surname": foundUser.Surname, "createOn": foundUser.CreatedOn})
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
	c.JSON(http.StatusOK, newUser)
}

func UpdateUser(c *gin.Context) {
	var updatedUser User
	var updateData UserUpdateData
	var foundUser User
	token, err := GetToken(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err})
		return
	}
	username := c.Param("username")
	parsedUsername, err := DecodeJWT(token)
	if username != parsedUsername {
		c.JSON(http.StatusForbidden, gin.H{"error": err})
		return
	}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
		return
	}
	ctx := c.Request.Context()
	collection := database.Collection("users")
	err = collection.FindOne(ctx, bson.M{"username": updateData.Username}).Decode(&foundUser)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err})
		return
	}
	if !VerifyPassword(updateData.Password, foundUser.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Wrong password"})
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
	err = collection.FindOneAndUpdate(ctx, bson.M{"username": updateData.Username}, bson.M{"$set": updateData}, options.FindOneAndUpdate().SetReturnDocument(options.After)).Decode(&updatedUser)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
		return
	}
	c.JSON(http.StatusOK, updatedUser)
}
func DeleteUser(c *gin.Context) {
	var deletedUser User
	var user User
	var foundUser User
	token, err := GetToken(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err})
		return
	}
	username := c.Param("username")
	parsedUsername, err := DecodeJWT(token)
	if username != parsedUsername {
		c.JSON(http.StatusForbidden, gin.H{"error": err})
		return
	}
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
		return
	}
	ctx := c.Request.Context()
	collection := database.Collection("users")
	err = collection.FindOne(ctx, bson.M{"username": user.Username}).Decode(&foundUser)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err})
		return
	}
	if !VerifyPassword(user.Password, foundUser.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Wrong password"})
		return
	}
	err = collection.FindOneAndDelete(ctx, bson.M{"username": foundUser.Username}).Decode(&deletedUser)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Account deleted"})
}

func CreatePost(c *gin.Context) {
	var post Post
	post.ID = primitive.NewObjectID()
	if err := c.ShouldBindJSON(&post); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	ctx := c.Request.Context()
	collection := database.Collection("posts")
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
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
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
	var foundPost Post
	var foundUser User
	token, err := GetToken(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err})
		return
	}
	ctx := c.Request.Context()
	posts := database.Collection("posts")
	users := database.Collection("users")
	postId, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
		return
	}
	err = posts.FindOne(ctx, bson.M{"_id": postId}).Decode(&foundPost)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err})
		return
	}
	postUserId := foundPost.UserID
	err = users.FindOne(ctx, bson.M{"_id": postUserId}).Decode(&foundUser)
	parsedUsername, err := DecodeJWT(token)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err})
		return
	}
	if foundUser.Username != parsedUsername {
		c.JSON(http.StatusForbidden, gin.H{"error": err})
		return
	}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err})
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
	err = posts.FindOneAndUpdate(ctx, bson.M{"_id": postId}, bson.M{"$set": update}, opts).Decode(&updatedPost)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err})
		return
	}
	c.JSON(http.StatusOK, updatedPost)
}
func DeletePost(c *gin.Context) {
	var deletedPost Post
	var foundPost Post
	var foundUser User
	token, err := GetToken(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err})
		return
	}

	ctx := c.Request.Context()
	postId, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
		return
	}
	posts := database.Collection("posts")
	users := database.Collection("users")
	err = posts.FindOne(ctx, bson.M{"_id": postId}).Decode(&foundPost)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err})
		return
	}
	postUserId := foundPost.UserID
	err = users.FindOne(ctx, bson.M{"_id": postUserId}).Decode(&foundUser)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err})
		return
	}

	parsedUsername, err := DecodeJWT(token)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err})
		return
	}
	if foundUser.Username != parsedUsername {
		c.JSON(http.StatusForbidden, gin.H{"error": err})
		return
	}
	err = posts.FindOneAndDelete(ctx, bson.M{"_id": postId}).Decode(&deletedPost)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err})
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
		c.JSON(http.StatusNoContent, gin.H{"error": err})
		return
	}
	defer cursor.Close(ctx)
	for cursor.Next(ctx) {
		var currentPost Post
		err := cursor.Decode(&currentPost)
		if err != nil {
			c.JSON(http.StatusNoContent, gin.H{"error": err})
			return
		}
		foundPosts = append(foundPosts, currentPost)
	}
	c.JSON(http.StatusOK, gin.H{"posts": foundPosts, "postCount": len(foundPosts)})
}
func GetTodaysFollowingPosts(c *gin.Context) {
	var foundUser User
	currentDate := time.Now()
	var foundPosts []Post
	ctx := c.Request.Context()
	users := database.Collection("users")
	posts := database.Collection("posts")
	token, err := GetToken(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err})
		return
	}
	decodedUsername, err := DecodeJWT(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err})
		return
	}

	err = users.FindOne(ctx, bson.M{"username": decodedUsername}).Decode(&foundUser)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err})
		return
	}
	for _, userId := range foundUser.Following {
		cursor, err := posts.Find(ctx, bson.M{"userId": userId, "createdOn": currentDate.Format("2006-01-02")})
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err})
			return
		}
		defer cursor.Close(ctx)
		for cursor.Next(ctx) {
			var foundPost Post

			err := cursor.Decode(&foundPost)
			if err != nil {
				c.JSON(http.StatusNoContent, gin.H{"error": err})
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
	currentDate := time.Now()
	var foundPosts []Post
	ctx := c.Request.Context()
	posts := database.Collection("posts")
	cursor, err := posts.Find(ctx, bson.M{"createdOn": currentDate.Format("2006-01-02")})
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err})
		return
	}
	defer cursor.Close(ctx)
	for cursor.Next(ctx) {
		var foundPost Post
		err := cursor.Decode(&foundPost)
		if err != nil {
			c.JSON(http.StatusNoContent, gin.H{"error": err})
			return
		}
		foundPosts = append(foundPosts, foundPost)
	}
	if len(foundPosts) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No posts were posted today!"})
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
		c.JSON(http.StatusNotFound, gin.H{"error": err})
	}
	defer cursor.Close(ctx)
	for cursor.Next(ctx) {
		var currentPost Post
		err := cursor.Decode(&currentPost)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err})
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
		c.JSON(http.StatusNotFound, gin.H{"error": err})
	}
	defer cursor.Close(ctx)
	for cursor.Next(ctx) {
		var currentTag Tag
		err := cursor.Decode(&currentTag)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err})
		}
		tags = append(tags, currentTag)
	}
	sort.Slice(tags, func(i, j int) bool {
		return len(tags[i].Posts) > len(tags[j].Posts)
	})
	c.JSON(http.StatusOK, tags)

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
func GenerateJWT(username string) (string, error) {
	key := []byte(os.Getenv("SECRET"))
	t := jwt.NewWithClaims(jwt.SigningMethodHS256,
		jwt.MapClaims{
			"username": username,
			"exp":      time.Now().Add(time.Hour * 24).Unix(),
		},
	)

	s, err := t.SignedString(key)
	if err != nil {
		return "", err
	}

	return s, nil
}
func VerifyJWT(tokenString string) (*jwt.Token, error) {

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
func DecodeJWT(tokenString string) (string, error) {
	token, err := VerifyJWT(tokenString)
	if err != nil {
		return "", fmt.Errorf("Couldn't verify token")
	}
	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		username, ok := claims["username"].(string)
		if !ok {
			return "", fmt.Errorf("Couldn't verify username")
		}
		return username, nil
	}
	return "", fmt.Errorf("Token doesn't match")
}
func Login(c *gin.Context) {
	var loginInfo LoginRequest
	if err := c.ShouldBindJSON(&loginInfo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user info"})
		return
	}
	var foundUser User
	ctx := c.Request.Context()
	collection := database.Collection("users")
	userError := collection.FindOne(ctx, bson.M{"username": loginInfo.Username}).Decode(&foundUser)
	if userError != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": userError.Error()})
		return
	}
	if !VerifyPassword(loginInfo.Password, foundUser.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": userError})
		return
	}

	token, err := GenerateJWT(foundUser.Username)
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
	router := gin.Default()
	router.Use(cors.New(CORS()))
	router.POST("/users", CreateUser)
	router.GET("/users/:username", GetUser)
	router.PUT("/users/:username", UpdateUser)
	router.DELETE("/users/:username", DeleteUser)
	router.POST("/login", Login)
	router.GET("/posts/:id", GetPost)
	router.GET("/:username/posts", GetPosts)
	router.POST("/posts")
	router.PUT("/:username/:postId", UpdatePost)
	router.DELETE("/:username/:postId", DeletePost)
	router.GET("/trending", TrendingTags)
	router.GET("/me", GetSessionUser)
	router.Run(":5000")
}
