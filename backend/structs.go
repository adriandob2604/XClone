package main

import (
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID            primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Name          string             `json:"name" bson:"name"`
	Surname       string             `json:"surname" bson:"surname"`
	Username      string             `json:"username" bson:"username"`
	Password      string             `json:"password" bson:"password"`
	Email         string             `json:"email" bson:"email"`
	PhoneNumber   string             `json:"phoneNumber" bson:"phoneNumber"`
	CreatedOn     time.Time          `json:"createdOn" bson:"createdOn"`
	BirthDate     time.Time          `json:"birthDate" bson:"birthDate"`
	Followers     []Follower         `json:"followers" bson:"followers"`
	Following     []Follower         `json:"following" bson:"following"`
	Notifications []Notification     `json:""`
}
type Follower struct {
	FollowerID primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	UserID     primitive.ObjectID `bson:"userId"`
	Username   string             `json:"username" bson:"username"`
}
type FollowerData struct {
	Username string `json:"username" bson:"username"`
}
type Comment struct {
	ID        primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	UserID    primitive.ObjectID `json:"userId" bson:"userId"`
	Comment   string             `json:"comment" bson:"comment"`
	Likes     int64              `json:"likes" bson:"likes"`
	CreatedAt time.Time          `json:"createdAt" bson:"createdAt"`
}
type UserUpdateData struct {
	Username    string    `json:"username"`
	Password    string    `json:"password"`
	Name        string    `json:"name"`
	Surname     string    `json:"surname"`
	Email       string    `json:"email"`
	PhoneNumber string    `json:"phoneNumber" `
	BirthDate   time.Time `json:"birthDate" `
}
type UserData struct {
	Name      string     `json:"name" bson:"name"`
	Surname   string     `json:"surname" bson:"surname"`
	Username  string     `json:"username" bson:"username"`
	CreatedOn time.Time  `json:"createdOn" bson:"createdOn"`
	Followers []Follower `json:"followers" bson:"followers"`
	Following []Follower `json:"following" bson:"following"`
}

type Post struct {
	ID        primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	UserID    primitive.ObjectID `json:"userId" bson:"userId"`
	Text      string             `json:"text" bson:"text"`
	File      http.File          `json:"file" bson:"file"`
	Comments  []Comment          `json:"comments" bson:"comments"`
	Tags      []string           `json:"tags" bson:"tags"`
	Likes     int64              `json:"likes" bson:"likes"`
	CreatedOn string             `json:"createdOn" bson:"createdOn"`
}
type PostUpdateInput struct {
	Text string   `json:"text,omitempty"`
	Tags []string `json:"tags,omitempty"`
}
type Tag struct {
	Posts []Post `json:"posts" bson:"posts"`
	Tag   string `json:"tag" bson:"tag"`
}
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type History struct {
	UserId   primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Searches []Search           `json:"searches" bson:"searches"`
}
type Search struct {
	SearchId primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Input    string             `json:"input" bson:"input"`
}
type SearchRequest struct {
	Input string `json:"input"`
}
type Notification struct {
	NotificationId primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Notification   string             `json:"notification" bson:"notification"`
	CreatedOn      string             `json:"createdOn" bson:"createdOn"`
}
