package login

import (
	"backend/authorization"
	"backend/db"
	"backend/password"
	"backend/users"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func Login(c *gin.Context) {
	var loginInfo LoginRequest
	var foundUser users.User
	if err := c.ShouldBindJSON(&loginInfo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user info"})
		return
	}
	ctx := c.Request.Context()
	collection := db.Database.Collection("users")
	err := collection.FindOne(ctx, bson.M{"username": loginInfo.Username}).Decode(&foundUser)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	if !password.VerifyPassword(loginInfo.Password, foundUser.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Wrong username or password"})
		return
	}

	token, err := authorization.GenerateJWT(foundUser.ID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Successfully logged in!", "token": token})
}
func Logout(c *gin.Context) {
	ctx := c.Request.Context()
	blacklist := db.Database.Collection("blacklist")
	token, err := authorization.GetToken(c)
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
