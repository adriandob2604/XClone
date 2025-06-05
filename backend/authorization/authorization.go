package authorization

import (
	"crypto/tls"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/MicahParks/keyfunc"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
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

var keycloakJWKS *keyfunc.JWKS

func InitJWKS() error {
	jwksURL := os.Getenv("KEYCLOAK_JWKS_URL")
	maxRetries := 10
	var err error

	tlsConfig := &tls.Config{
		InsecureSkipVerify: true,
	}

	customTransport := &http.Transport{
		TLSClientConfig: tlsConfig,
	}

	httpClient := &http.Client{
		Transport: customTransport,
		Timeout:   10 * time.Second,
	}

	options := keyfunc.Options{
		RefreshInterval: time.Hour,
		RefreshErrorHandler: func(err error) {
			log.Printf("JWKS refresh error: %v", err)
		},
		Client: httpClient,
	}

	for i := 1; i <= maxRetries; i++ {
		keycloakJWKS, err = keyfunc.Get(jwksURL, options)

		if err == nil {
			log.Println("Successfully initialized JWKS")
			return nil
		}

		log.Printf("Attempt %d: Failed to initialize JWKS: %v", i, err)
		time.Sleep(5 * time.Second)
	}

	return err
}
func VerifyJWT(tokenString string) (*jwt.Token, error) {
	token, err := jwt.Parse(tokenString, keycloakJWKS.Keyfunc)
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
		sub, ok := claims["sub"].(string)
		if !ok {
			return "", fmt.Errorf("Couldn't find 'sub' in token")
		}
		return sub, nil
	}
	return "", fmt.Errorf("Token doesn't match")
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
