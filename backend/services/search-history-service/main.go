package main

import (
	"backend/corsConfig"
	"backend/services/search-history-service/history"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.Use(cors.New(corsConfig.CORS()))
	router.GET("/history", history.GetHistory)
	router.POST("/history", history.PostHistoryItem)
	router.DELETE("/history/:id", history.DeleteHistoryItem)
	router.DELETE("/history", history.DeleteHistory)
	router.Run(":5000")

}
