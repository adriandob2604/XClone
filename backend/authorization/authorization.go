package authorization

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

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
		if c.Request.URL.Path == "/users" || c.Request.URL.Path == "/" {
			c.Next()
			return
		}
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
