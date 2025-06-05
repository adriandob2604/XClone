package users

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/adriandob2604/XClone/backend/db"
	"github.com/adriandob2604/XClone/backend/keycloak"
	"github.com/adriandob2604/XClone/backend/password"
	"github.com/adriandob2604/XClone/backend/supabase"
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
	ID              primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	BackgroundImage string             `json:"backgroundImageUrl" bson:"backgroundImageUrl"`
	ProfileImage    string             `json:"profileImageUrl" bson:"profileImageUrl"`
	Name            string             `json:"name" bson:"name"`
	Surname         string             `json:"surname" bson:"surname"`
	Username        string             `json:"username" bson:"username"`
	CreatedOn       time.Time          `json:"createdOn" bson:"createdOn"`
	Followers       []Follower         `json:"followers" bson:"followers"`
	Following       []Follower         `json:"following" bson:"following"`
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
func GetDesiredUsers(c *gin.Context) {
	var users []UserData
	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	strLimit := c.DefaultQuery("limit", "10")
	strOffset := c.DefaultQuery("offset", "0")
	startsWith := c.DefaultQuery("startsWith", "a")
	if len(startsWith) > 1 {
		startsWith = string(startsWith[0])
	}
	limit, err := strconv.Atoi(strLimit)
	if err != nil || limit < 1 {
		limit = 10
	}

	offset, err := strconv.Atoi(strOffset)
	if err != nil || offset < 0 {
		offset = 0
	}

	ctx := c.Request.Context()
	collection := db.Database.Collection("users")
	filter := bson.M{
		"_id": bson.M{
			"$ne": decodedId.(primitive.ObjectID),
		},
	}
	if startsWith != "" {
		filter["username"] = bson.M{
			"$regex":   "^" + startsWith,
			"$options": "i",
		}
	}
	cursor, err := collection.Find(
		ctx,
		filter,
		options.Find().
			SetLimit(int64(limit)).
			SetSkip(int64(offset)),
	)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(ctx)
	for cursor.Next(ctx) {
		var foundUser UserData
		err := cursor.Decode(&foundUser)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err})
			return
		}
		users = append(users, foundUser)
	}
	c.JSON(http.StatusOK, users)
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
	keycloakUrl := "https://cache/auth/admin/realms/my-realm/users"
	var newUser User
	var keycloakUser keycloak.KeycloakUser
	newUser.ID = primitive.NewObjectID()

	token, err := keycloak.GetAdminToken()
	if err != nil {
		log.Printf("Failed to get admin token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get admin token"})
		return
	}
	if err := c.ShouldBindJSON(&newUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	keycloakUser.Username = newUser.Username
	keycloakUser.Password = newUser.Password
	if err := keycloak.CreateKeycloakUser(token, keycloakUser, keycloakUrl); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	newUser.Password = password.HashPassword(newUser.Password)
	ctx := c.Request.Context()
	collection := db.Database.Collection("users")
	_, err = collection.InsertOne(ctx, newUser)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User created"})

}

func UpdateUser(c *gin.Context) {
	var updateData UserUpdateData
	var foundUser UserData
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
	result := collection.FindOneAndUpdate(ctx, bson.M{"_id": decodedId}, bson.M{"$set": updateFields})
	if result.Err() != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": result.Err().Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Successfully updated user"})
}

func UploadProfilePicture(c *gin.Context) {
	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	profileFile, err := c.FormFile("profile_picture")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	openedProfileFile, err := profileFile.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer openedProfileFile.Close()

	profilePicturePath := fmt.Sprintf("uploads/%s/profile.jpg", decodedId)

	_, err = supabase.SupabaseClient.Storage.UploadFile("users", profilePicturePath, openedProfileFile)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	profilePictureUrl := supabase.SupabaseClient.Storage.GetPublicUrl("users", profilePicturePath)

	ctx := c.Request.Context()
	collection := db.Database.Collection("users")
	result := collection.FindOneAndUpdate(ctx, bson.M{"_id": decodedId}, bson.M{
		"$set": bson.M{"profileImageUrl": profilePictureUrl},
	})
	if result.Err() != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Err().Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Successfully changed profile picture"})
}
func UploadBackgroundPicture(c *gin.Context) {
	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	BackgroundFile, err := c.FormFile("background_picture")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	openedBackgroundFile, err := BackgroundFile.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer openedBackgroundFile.Close()

	backgroundPicturePath := fmt.Sprintf("uploads/%s/background.jpg", decodedId)

	_, err = supabase.SupabaseClient.Storage.UploadFile("users", backgroundPicturePath, openedBackgroundFile)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	backgroundPictureUrl := supabase.SupabaseClient.Storage.GetPublicUrl("users", backgroundPicturePath)

	ctx := c.Request.Context()
	collection := db.Database.Collection("users")
	result := collection.FindOneAndUpdate(ctx, bson.M{"_id": decodedId}, bson.M{"$set": bson.M{"backgroundImageUrl": backgroundPictureUrl.SignedURL}})
	if result.Err() != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Err().Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Successfully changed background picture"})
}
func DeleteUser(c *gin.Context) {
	var deletedUser User
	decodedId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userId := c.Param("id")
	objectUserId, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if decodedId == objectUserId {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Can't delete yourself"})
		return
	}

	ctx := c.Request.Context()
	collection := db.Database.Collection("users")

	err = collection.FindOneAndDelete(ctx, bson.M{"_id": objectUserId}).Decode(&deletedUser)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	token, err := keycloak.GetAdminToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	keycloakUserId, err := keycloak.GetKeycloakUserId(token, deletedUser.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := keycloak.DeleteKeycloakUser(token, keycloakUserId); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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
	if len(users) > 0 && len(users) <= 3 {
		c.JSON(http.StatusOK, users)
		return
	}
	if len(users) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No users to follow!"})
		return
	}

	usedIndexes := make(map[int]bool)
	for len(usersToFollow) < 3 {
		randomIndex := rand.Intn(len(users))
		if !usedIndexes[randomIndex] {
			usersToFollow = append(usersToFollow, users[randomIndex])
			usedIndexes[randomIndex] = true
		}

	}
	c.JSON(http.StatusOK, usersToFollow)
}
