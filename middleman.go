package main

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
)

type MiddlemanConfig struct {
	EncryptionKey string `json:"encryption_key"`
	SFTPServerURL string `json:"sftp_server_url"`
	ListenPort    string `json:"listen_port"`
}

var config MiddlemanConfig

func main() {
	fmt.Println("GreenHost Middleman Service")
	fmt.Println("===========================")
	
	// Load configuration
	loadConfig()
	
	// Setup HTTP routes
	http.HandleFunc("/api/create-account", handleEncryptedRequest)
	http.HandleFunc("/api/add-user", handleEncryptedRequest)
	http.HandleFunc("/api/health", handleEncryptedRequest)
	http.HandleFunc("/health", handleHealthCheck)
	
	fmt.Printf("Middleman listening on localhost:%s\n", config.ListenPort)
	fmt.Printf("Forwarding to SFTP server: %s\n", config.SFTPServerURL)
	fmt.Println("Ready to process encrypted requests...")
	
	log.Fatal(http.ListenAndServe(":"+config.ListenPort, nil))
}

func loadConfig() {
	// Check if config exists
	if _, err := os.Stat("middleman_config.json"); os.IsNotExist(err) {
		// Create default config
		config = MiddlemanConfig{
			EncryptionKey: generateEncryptionKey(),
			SFTPServerURL: "http://localhost:4444",
			ListenPort:    "8882",
		}
		saveConfig()
		fmt.Println("Created new configuration file: middleman_config.json")
		fmt.Printf("Generated encryption key: %s\n", config.EncryptionKey)
		fmt.Println("Share this 32-character key with the website for secure communication!")
	} else {
		// Load existing config
		data, err := os.ReadFile("middleman_config.json")
		if err != nil {
			log.Fatal("Failed to load config:", err)
		}
		
		if err := json.Unmarshal(data, &config); err != nil {
			log.Fatal("Failed to parse config:", err)
		}
		
		fmt.Printf("Loaded configuration. Encryption key: %s\n", config.EncryptionKey)
	}
}

func saveConfig() {
	data, err := json.Marshal(config)
	if err != nil {
		log.Fatal("Failed to marshal config:", err)
	}
	
	if err := os.WriteFile("middleman_config.json", data, 0644); err != nil {
		log.Fatal("Failed to save config:", err)
	}
}

func generateEncryptionKey() string {
	// Generate a 32-character key for AES-256
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return fmt.Sprintf("%x", bytes)[:32]
}

func handleEncryptedRequest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	// Read encrypted payload from request
	var encryptedPayload struct {
		Data string `json:"data"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&encryptedPayload); err != nil {
		sendEncryptedResponse(w, false, "Invalid request format", nil)
		return
	}
	
	// Decrypt the payload
	decryptedData, err := decryptPayload(encryptedPayload.Data)
	if err != nil {
		log.Printf("Decryption failed: %v", err)
		sendEncryptedResponse(w, false, "Decryption failed", nil)
		return
	}
	
	log.Printf("Received encrypted request for: %s", r.URL.Path)
	
	// Forward to SFTP server
	endpoint := strings.TrimPrefix(r.URL.Path, "/api")
	sftpURL := config.SFTPServerURL + endpoint
	
	resp, err := http.Post(sftpURL, "application/json", bytes.NewReader(decryptedData))
	if err != nil {
		log.Printf("Failed to forward request: %v", err)
		sendEncryptedResponse(w, false, "Failed to process request", nil)
		return
	}
	defer resp.Body.Close()
	
	// Read response from SFTP server
	responseData, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Failed to read response: %v", err)
		sendEncryptedResponse(w, false, "Failed to read response", nil)
		return
	}
	
	// Parse the response
	var sftpResponse map[string]interface{}
	if err := json.Unmarshal(responseData, &sftpResponse); err != nil {
		log.Printf("Failed to parse response: %v", err)
		sendEncryptedResponse(w, false, "Invalid response format", nil)
		return
	}
	
	log.Printf("Request processed successfully")
	
	// Send encrypted response back
	success := sftpResponse["success"].(bool)
	message := sftpResponse["message"].(string)
	data := sftpResponse["data"]
	
	sendEncryptedResponse(w, success, message, data)
}

func handleHealthCheck(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"status":         "healthy",
		"service":        "middleman",
		"encryption_key": config.EncryptionKey[:8] + "...", // Show first 8 chars only
		"sftp_server":    config.SFTPServerURL,
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func decryptPayload(encryptedData string) ([]byte, error) {
	// Decode base64
	ciphertext, err := base64.StdEncoding.DecodeString(encryptedData)
	if err != nil {
		return nil, fmt.Errorf("base64 decode failed: %v", err)
	}
	
	// Convert hex key to bytes
	key := []byte(config.EncryptionKey)
	if len(key) != 32 {
		return nil, fmt.Errorf("invalid key length: %d", len(key))
	}
	
	// Decrypt
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	
	nonceSize := gcm.NonceSize()
	if len(ciphertext) < nonceSize {
		return nil, fmt.Errorf("ciphertext too short")
	}
	
	nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, err
	}
	
	return plaintext, nil
}

func encryptPayload(data []byte) (string, error) {
	key := []byte(config.EncryptionKey)
	
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}
	
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}
	
	ciphertext := gcm.Seal(nonce, nonce, data, nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

func sendEncryptedResponse(w http.ResponseWriter, success bool, message string, data interface{}) {
	response := map[string]interface{}{
		"success": success,
		"message": message,
		"data":    data,
	}
	
	responseJSON, err := json.Marshal(response)
	if err != nil {
		http.Error(w, "Failed to marshal response", http.StatusInternalServerError)
		return
	}
	
	// Encrypt the response
	encryptedData, err := encryptPayload(responseJSON)
	if err != nil {
		http.Error(w, "Failed to encrypt response", http.StatusInternalServerError)
		return
	}
	
	encryptedResponse := map[string]string{
		"data": encryptedData,
	}
	
	w.Header().Set("Content-Type", "application/json")
	if !success {
		w.WriteHeader(http.StatusBadRequest)
	}
	
	json.NewEncoder(w).Encode(encryptedResponse)
}