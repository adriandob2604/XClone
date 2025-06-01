package main

import (
	"backend/authorization"
	"backend/chats"
	"backend/corsConfig"
	"backend/db"
	"backend/supabase"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func init() {
	if err := db.Connect(); err != nil {
		log.Fatal("Couldn't connect to database")
	}
	if err := supabase.ConnectToSupabase(); err != nil {
		log.Fatal("Couldn't connect to supabase")
	}
}
func main() {
	router := gin.Default()
	router.Use(cors.New(corsConfig.CORS()))

	// router.POST("/login", login.Login)

	router.POST("/chats/:id", authorization.AuthMiddleware(), chats.PostChatMessage)
	router.GET("/chats/:id", authorization.AuthMiddleware(), chats.GetChatMessages)
	router.DELETE("/chats/:id", authorization.AuthMiddleware(), chats.DeleteChatMessage)
	router.PATCH("/chats/:id", authorization.AuthMiddleware(), chats.UpdateChatMessage)
	router.Run(":5000")
}
