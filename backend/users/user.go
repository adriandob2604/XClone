package users

import (
	"backend/chats"
	"backend/db"
	"backend/password"
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
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
	Chats           []chats.Chat       `json:"chats" bson:"chats"`
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
type Follower struct {
	UserID   primitive.ObjectID `bson:"userId"`
	Username string             `json:"username" bson:"username"`
}
type FollowerData struct {
	Username string `json:"username" bson:"username"`
}

func GetUser(c *gin.Context) {
	var foundUser UserData
	var normalUser UserData
	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	username := c.Param("username")
	collection := db.Database.Collection("users")

	ctx := c.Request.Context()

	err := collection.FindOne(ctx, bson.M{"_id": decodedId}).Decode(&foundUser)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "User doesn't exist"})
		return
	}
	if foundUser.Username == username {
		c.JSON(http.StatusOK, gin.H{"user": foundUser, "isOwn": true})
	} else {
		err := collection.FindOne(ctx, bson.M{"username": username}).Decode(&normalUser)
		if err != nil {
			c.JSON(http.StatusNoContent, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"user": normalUser, "isOwn": false})
	}
}
func Me(c *gin.Context) {
	var foundUser UserData
	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	collection := db.Database.Collection("users")

	ctx := c.Request.Context()

	err := collection.FindOne(ctx, bson.M{"_id": decodedId}).Decode(&foundUser)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error:": err})
		return
	}
	c.JSON(http.StatusOK, foundUser)
}

func CreateUser(c *gin.Context) {
	var newUser User
	newUser.ID = primitive.NewObjectID()
	if err := c.ShouldBindJSON(&newUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	newUser.Password = password.HashPassword(newUser.Password)
	ctx := c.Request.Context()
	collection := db.Database.Collection("users")
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

	collection := db.Database.Collection("users")
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
	collection := db.Database.Collection("users")

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
func ToFollow(c *gin.Context) {
	var users []UserData
	var usersToFollow []UserData
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	ctx := c.Request.Context()
	collection := db.Database.Collection("users")
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
