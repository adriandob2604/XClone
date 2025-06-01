package main

import (
	"backend/corsConfig"
	"backend/services/users-service/users"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.Use(cors.New(corsConfig.CORS()))
	router.POST("/users", users.CreateUser)
	router.GET("/users", users.GetDesiredUsers)
	router.GET("/users/:username", users.GetUser)
	router.GET("/me", users.Me)
	router.PUT("/users", users.UpdateUser)
	router.PUT("/me/profile-picture", users.UploadProfilePicture)
	router.PUT("/me/background-picture", users.UploadBackgroundPicture)
	router.DELETE("/users/", users.DeleteUser)
	router.GET("/to_follow", users.ToFollow)
}
