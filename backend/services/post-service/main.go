package main

import (
	"log"

	"github.com/adriandob2604/XClone/backend/authorization"
	"github.com/adriandob2604/XClone/backend/corsConfig"
	"github.com/adriandob2604/XClone/backend/db"
	"github.com/adriandob2604/XClone/backend/services/post-service/posts"
	"github.com/adriandob2604/XClone/backend/supabase"
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
	if err := authorization.InitJWKS(); err != nil {
		log.Fatalf("Failed to initialize JWKS: %v", err)
	}
}
func main() {
	router := gin.Default()
	router.Use(cors.New(corsConfig.CORS()))
	router.Use(authorization.AuthMiddleware())
	router.GET("/post/:id", posts.GetPost)
	router.GET("/:username", posts.GetPosts)
	router.POST("/", posts.CreatePost)
	router.PATCH("/:postId", posts.UpdatePost)
	router.DELETE("/:postId", posts.DeletePost)
	router.GET("/for_you_posts", posts.GetForYouPosts)
	router.GET("/following_posts", posts.GetFollowingPosts)
	router.Run(":5000")
}
