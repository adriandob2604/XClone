package main

import (
	"backend/corsConfig"
	"backend/services/post-service/posts"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.Use(cors.New(corsConfig.CORS()))
	router.GET("/posts/:id", posts.GetPost)
	router.GET("/:username/posts", posts.GetPosts)
	router.POST("/posts", posts.CreatePost)
	router.PATCH("/posts/:postId", posts.UpdatePost)
	router.DELETE("/posts/:postId", posts.DeletePost)
	router.GET("/for_you_posts", posts.GetForYouPosts)
	router.GET("/following_posts", posts.GetFollowingPosts)
	router.Run(":5004")
}
