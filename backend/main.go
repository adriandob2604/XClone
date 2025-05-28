package main

import (
	"backend/authorization"
	"backend/aws"
	"backend/chats"
	"backend/db"
	"backend/explore"
	"backend/followers"
	"backend/history"
	"backend/login"
	"backend/notifications"
	"backend/posts"
	"backend/tags"
	"backend/users"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CORS() cors.Config {
	url := "http://localhost:3000"
	config := cors.Config{
		AllowOrigins:     []string{url},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	return config
}

func init() {
	if err := db.Connect(); err != nil {
		log.Fatal("Couldn't connect to database")
	}
	if err := aws.ConnectAWS(); err != nil {
		log.Fatal("Couldn't connect to aws")
	}
}
func main() {
	gin.SetMode(gin.DebugMode)
	router := gin.Default()
	router.Use(cors.New(CORS()))
	router.POST("/users", users.CreateUser)
	router.GET("/users", authorization.AuthMiddleware(), users.GetAllUsers)
	router.GET("/users/:username", authorization.AuthMiddleware(), users.GetUser)
	router.GET("/me", authorization.AuthMiddleware(), users.Me)
	router.PUT("/users", authorization.AuthMiddleware(), users.UpdateUser)
	router.DELETE("/users", authorization.AuthMiddleware(), users.DeleteUser)
	router.GET("/to_follow", authorization.AuthMiddleware(), users.ToFollow)
	router.POST("/login", login.Login)
	router.GET("/posts/:id", posts.GetPost)
	router.GET("/:username/posts", posts.GetPosts)
	router.POST("/posts", authorization.AuthMiddleware(), posts.CreatePost)
	router.PATCH("/posts/:postId", authorization.AuthMiddleware(), posts.UpdatePost)
	router.DELETE("/posts/:postId", authorization.AuthMiddleware(), posts.DeletePost)
	router.GET("/trending", tags.TrendingTags)
	router.GET("/for_you_posts", authorization.AuthMiddleware(), posts.GetForYouPosts)
	router.GET("/following_posts", authorization.AuthMiddleware(), posts.GetFollowingPosts)
	router.GET("/history", authorization.AuthMiddleware(), history.GetHistory)
	router.POST("/history", authorization.AuthMiddleware(), history.PostHistoryItem)
	router.DELETE("/history/:id", authorization.AuthMiddleware(), history.DeleteHistoryItem)
	router.DELETE("/history", authorization.AuthMiddleware(), history.DeleteHistory)
	router.POST("/follow", authorization.AuthMiddleware(), followers.FollowUser)
	router.DELETE("/unfollow/:userId", authorization.AuthMiddleware(), followers.UnfollowUser)
	router.GET("/:username/followers", authorization.AuthMiddleware(), followers.Followers)
	router.GET("/notifications", authorization.AuthMiddleware(), notifications.GetNotifications)
	router.POST("/notifications", authorization.AuthMiddleware(), notifications.PostNotification)
	router.POST("/chats/:id", authorization.AuthMiddleware(), chats.PostChatMessage)
	router.GET("/chats/:id", authorization.AuthMiddleware(), chats.GetChatMessages)
	router.DELETE("/chats/:id", authorization.AuthMiddleware(), chats.DeleteChatMessage)
	router.PATCH("/chats/:id", authorization.AuthMiddleware(), chats.UpdateChatMessage)
	router.GET("/explore", authorization.AuthMiddleware(), explore.GetExploreSearches)
	router.Run(":5000")
}
