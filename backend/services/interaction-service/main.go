package main

import (
	"backend/authorization"
	"backend/corsConfig"
	"backend/services/interaction-service/followers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.Use(cors.New(corsConfig.CORS()))
	router.Use(authorization.AuthMiddleware())
	router.POST("/follow", followers.FollowUser)
	router.DELETE("/unfollow/:userId", followers.UnfollowUser)
	router.GET("/:username/followers", followers.Followers)
	router.Run(":5002")
}
