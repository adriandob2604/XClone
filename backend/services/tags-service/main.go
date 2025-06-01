package main

import (
	"backend/corsConfig"
	"backend/services/tags-service/tags"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.Use(cors.New(corsConfig.CORS()))
	router.GET("/trending", tags.TrendingTags)
	router.Run(":5000")

}
