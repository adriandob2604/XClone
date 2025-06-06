package keycloak

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type KeycloakUser struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func GetAdminToken() (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	data := url.Values{}
	data.Set("client_id", "admin-cli")
	data.Set("username", "admin")
	data.Set("password", "admin")
	data.Set("grant_type", "password")

	req, err := http.NewRequestWithContext(
		ctx,
		"POST",
		"https://cache/auth/realms/master/protocol/openid-connect/token",
		strings.NewReader(data.Encode()),
	)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	fmt.Println("Keycloak response body:", string(body))
	fmt.Println("Keycloak response status:", resp.StatusCode)

	var result struct {
		AccessToken string `json:"access_token"`
		Error       string `json:"error"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("JSON decode failed: %w", err)
	}

	if result.Error != "" {
		return "", fmt.Errorf("OAuth error: %s", result.Error)
	}

	if result.AccessToken == "" {
		return "", errors.New("empty access token in response")
	}
	return result.AccessToken, nil
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

	jsonData, err := json.Marshal(userData)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", "https://cache/auth/admin/realms/my-realm/users", bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
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
	url := fmt.Sprintf("https://cache/auth/admin/realms/my-realm/users?username=%s", username)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", err
	}
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
	url := fmt.Sprintf("https://cache/auth/auth/admin/realms/my-realm/users/%s", userId)

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
