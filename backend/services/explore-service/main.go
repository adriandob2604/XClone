package main

import (
	"backend/authorization"
	"backend/corsConfig"
	"backend/services/explore-service/explore"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.Use(cors.New(corsConfig.CORS()))
	router.Use(authorization.AuthMiddleware())
	router.GET("/explore", explore.GetExploreSearches)
	router.Run(":5001")

}
