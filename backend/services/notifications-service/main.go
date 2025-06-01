package main

import (
	"backend/corsConfig"
	"backend/services/notifications-service/notifications"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.Use(cors.New(corsConfig.CORS()))
	router.GET("/notifications", notifications.GetNotifications)
	router.POST("/notifications", notifications.PostNotification)
	router.Run(":5000")
}
