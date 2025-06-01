package keycloak

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
)

type KeycloakUser struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func GetAdminToken() (string, error) {
	data := url.Values{}
	data.Set("client_id", "admin-cli")
	data.Set("username", "admin")
	data.Set("password", "admin-password")
	data.Set("grant_type", "password")

	resp, err := http.PostForm("http://localhost:8080/realms/master/protocol/openid-connect/token", data)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	token, ok := result["access_token"].(string)
	if !ok {
		return "", errors.New("unable to get access_token")
	}

	return token, nil
}
func CreateKeycloakUser(token string, user KeycloakUser, keycloakUrl string) error {
	userData := map[string]interface{}{
		"username": user.Username,
		"email":    user.Email,
		"enabled":  true,
		"credentials": []map[string]interface{}{
			{
				"type":      "password",
				"value":     user.Password,
				"temporary": false,
			},
		},
	}

	jsonData, _ := json.Marshal(userData)

	req, _ := http.NewRequest("POST", "http://localhost:8080/admin/realms/my-realm/users", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed to create user: %s", string(bodyBytes))
	}

	return nil
}
func GetKeycloakUserId(token string, username string) (string, error) {
	url := fmt.Sprintf("http://localhost:8080/auth/admin/realms/my-realm/users?username=%s", username)

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to get user ID, status: %d", resp.StatusCode)
	}

	var users []map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&users)

	if len(users) == 0 {
		return "", errors.New("user not found")
	}

	id, ok := users[0]["id"].(string)
	if !ok {
		return "", errors.New("could not parse user ID")
	}

	return id, nil
}

func DeleteKeycloakUser(token, userId string) error {
	url := fmt.Sprintf("http://localhost:8080/auth/admin/realms/my-realm/users/%s", userId)

	req, _ := http.NewRequest("DELETE", url, nil)
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed to delete user: %s", string(bodyBytes))
	}

	return nil
}
