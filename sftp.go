package main

import (
	"bufio"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

type CreateAccountRequest struct {
	CompanyName  string `json:"company_name"`
	CompanyEmail string `json:"company_email"`
	QuotaGB      int    `json:"quota_gb"`
	Password     string `json:"password"`
	APIKey       string `json:"api_key"`
}

type AddUserRequest struct {
	CompanyName string `json:"company_name"`
	APIKey      string `json:"api_key"`
	Username    string `json:"username"`
	UserEmail   string `json:"user_email"`
	Password    string `json:"password"`
}

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type UserData struct {
	Username string `json:"username"`
	SFTPLink string `json:"sftp_link"`
	WebLink  string `json:"web_link"`
}

var (
	serverIP    string
	customers   = make(map[string]CustomerData)
	customersDir = "customers"
)

type CustomerData struct {
	CompanyName  string             `json:"company_name"`
	CompanyEmail string             `json:"company_email"`
	QuotaGB      int                `json:"quota_gb"`
	APIKey       string             `json:"api_key"`
	Users        map[string]UserData `json:"users"`
}

func main() {
	fmt.Println("GreenHost SFTP Server Management System")
	fmt.Println("======================================")
	
	// Get server IP on first run
	if _, err := os.Stat("server_config.json"); os.IsNotExist(err) {
		setupServerIP()
	} else {
		loadServerConfig()
	}
	
	// Create customers directory
	if err := os.MkdirAll(customersDir, 0755); err != nil {
		log.Fatal("Failed to create customers directory:", err)
	}
	
	// Load existing customers
	loadCustomers()
	
	// Start HTTP server
	http.HandleFunc("/create-account", handleCreateAccount)
	http.HandleFunc("/add-user", handleAddUser)
	http.HandleFunc("/health", handleHealth)
	
	fmt.Printf("Server listening on %s:4444\n", serverIP)
	fmt.Println("Ready to receive requests from website...")
	
	log.Fatal(http.ListenAndServe(":4444", nil))
}

func setupServerIP() {
	reader := bufio.NewReader(os.Stdin)
	fmt.Print("Enter the IP address this server should run on: ")
	ip, _ := reader.ReadString('\n')
	serverIP = strings.TrimSpace(ip)
	
	config := map[string]string{"server_ip": serverIP}
	saveServerConfig(config)
	
	fmt.Printf("Server IP set to: %s\n", serverIP)
}

func loadServerConfig() {
	data, err := os.ReadFile("server_config.json")
	if err != nil {
		log.Fatal("Failed to load server config:", err)
	}
	
	var config map[string]string
	if err := json.Unmarshal(data, &config); err != nil {
		log.Fatal("Failed to parse server config:", err)
	}
	
	serverIP = config["server_ip"]
}

func saveServerConfig(config map[string]string) {
	data, err := json.Marshal(config)
	if err != nil {
		log.Fatal("Failed to marshal server config:", err)
	}
	
	if err := os.WriteFile("server_config.json", data, 0644); err != nil {
		log.Fatal("Failed to save server config:", err)
	}
}

func loadCustomers() {
	files, err := filepath.Glob(filepath.Join(customersDir, "*.json"))
	if err != nil {
		log.Printf("Failed to load customers: %v", err)
		return
	}
	
	for _, file := range files {
		data, err := os.ReadFile(file)
		if err != nil {
			log.Printf("Failed to read customer file %s: %v", file, err)
			continue
		}
		
		var customer CustomerData
		if err := json.Unmarshal(data, &customer); err != nil {
			log.Printf("Failed to parse customer file %s: %v", file, err)
			continue
		}
		
		customers[customer.APIKey] = customer
		fmt.Printf("Loaded customer: %s\n", customer.CompanyName)
	}
}

func saveCustomer(customer CustomerData) error {
	filename := filepath.Join(customersDir, fmt.Sprintf("%s.json", customer.APIKey))
	data, err := json.Marshal(customer)
	if err != nil {
		return err
	}
	
	return os.WriteFile(filename, data, 0644)
}

func generateAPIKey() string {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return fmt.Sprintf("%x", bytes)
}

func handleCreateAccount(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	var req CreateAccountRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendResponse(w, false, "Invalid JSON payload", nil)
		return
	}
	
	// Generate API key if not provided
	if req.APIKey == "" {
		req.APIKey = generateAPIKey()
	}
	
	// Create customer record
	customer := CustomerData{
		CompanyName:  req.CompanyName,
		CompanyEmail: req.CompanyEmail,
		QuotaGB:      req.QuotaGB,
		APIKey:       req.APIKey,
		Users:        make(map[string]UserData),
	}
	
	// Create SFTP group and setup quota
	if err := createSFTPGroup(req.CompanyName, req.QuotaGB); err != nil {
		sendResponse(w, false, fmt.Sprintf("Failed to create SFTP group: %v", err), nil)
		return
	}
	
	// Save customer data
	customers[req.APIKey] = customer
	if err := saveCustomer(customer); err != nil {
		sendResponse(w, false, fmt.Sprintf("Failed to save customer: %v", err), nil)
		return
	}
	
	log.Printf("Created account for %s (%s) with %dGB quota", req.CompanyName, req.CompanyEmail, req.QuotaGB)
	
	response := map[string]interface{}{
		"api_key":       req.APIKey,
		"company_name":  req.CompanyName,
		"quota_gb":      req.QuotaGB,
		"server_ip":     serverIP,
	}
	
	sendResponse(w, true, "Account created successfully", response)
}

func handleAddUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	var req AddUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendResponse(w, false, "Invalid JSON payload", nil)
		return
	}
	
	// Verify API key and get customer
	customer, exists := customers[req.APIKey]
	if !exists {
		sendResponse(w, false, "Invalid API key", nil)
		return
	}
	
	// Check if user already exists
	if _, exists := customer.Users[req.Username]; exists {
		sendResponse(w, false, "User already exists", nil)
		return
	}
	
	// Create SFTP user
	sftpLink, webLink, err := createSFTPUser(customer.CompanyName, req.Username, req.Password)
	if err != nil {
		sendResponse(w, false, fmt.Sprintf("Failed to create SFTP user: %v", err), nil)
		return
	}
	
	// Add user to customer data
	userData := UserData{
		Username: req.Username,
		SFTPLink: sftpLink,
		WebLink:  webLink,
	}
	
	customer.Users[req.Username] = userData
	customers[req.APIKey] = customer
	
	// Save updated customer data
	if err := saveCustomer(customer); err != nil {
		sendResponse(w, false, fmt.Sprintf("Failed to save customer data: %v", err), nil)
		return
	}
	
	log.Printf("Added user %s to company %s", req.Username, customer.CompanyName)
	
	response := map[string]interface{}{
		"username":   req.Username,
		"sftp_link":  sftpLink,
		"web_link":   webLink,
		"server_ip":  serverIP,
	}
	
	sendResponse(w, true, "User added successfully", response)
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"status":     "healthy",
		"server_ip":  serverIP,
		"customers":  len(customers),
	}
	sendResponse(w, true, "Server is healthy", response)
}

func createSFTPGroup(companyName string, quotaGB int) error {
	groupName := strings.ToLower(strings.ReplaceAll(companyName, " ", "_"))
	
	// Create group
	cmd := exec.Command("sudo", "groupadd", groupName)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to create group: %v", err)
	}
	
	// Create directory
	groupDir := fmt.Sprintf("/home/sftp/%s", groupName)
	cmd = exec.Command("sudo", "mkdir", "-p", groupDir)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to create directory: %v", err)
	}
	
	// Set permissions
	cmd = exec.Command("sudo", "chown", fmt.Sprintf("root:%s", groupName), groupDir)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to set ownership: %v", err)
	}
	
	cmd = exec.Command("sudo", "chmod", "750", groupDir)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to set permissions: %v", err)
	}
	
	log.Printf("Created SFTP group %s with %dGB quota", groupName, quotaGB)
	return nil
}

func createSFTPUser(companyName, username, password string) (string, string, error) {
	groupName := strings.ToLower(strings.ReplaceAll(companyName, " ", "_"))
	userHome := fmt.Sprintf("/home/sftp/%s/%s", groupName, username)
	
	// Create user
	cmd := exec.Command("sudo", "useradd", "-g", groupName, "-d", userHome, "-m", "-s", "/bin/false", username)
	if err := cmd.Run(); err != nil {
		return "", "", fmt.Errorf("failed to create user: %v", err)
	}
	
	// Set password
	cmd = exec.Command("sudo", "chpasswd")
	cmd.Stdin = strings.NewReader(fmt.Sprintf("%s:%s", username, password))
	if err := cmd.Run(); err != nil {
		return "", "", fmt.Errorf("failed to set password: %v", err)
	}
	
	// Generate links
	sftpLink := fmt.Sprintf("sftp://%s@%s", username, serverIP)
	webLink := fmt.Sprintf("http://%s:8080/files/%s", serverIP, username)
	
	log.Printf("Created SFTP user %s in group %s", username, groupName)
	
	return sftpLink, webLink, nil
}

func sendResponse(w http.ResponseWriter, success bool, message string, data interface{}) {
	response := APIResponse{
		Success: success,
		Message: message,
		Data:    data,
	}
	
	w.Header().Set("Content-Type", "application/json")
	if !success {
		w.WriteHeader(http.StatusBadRequest)
	}
	
	json.NewEncoder(w).Encode(response)
}

// Encryption functions for security
func encrypt(data []byte, key []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}
	
	ciphertext := gcm.Seal(nonce, nonce, data, nil)
	return ciphertext, nil
}

func decrypt(data []byte, key []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	
	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return nil, fmt.Errorf("ciphertext too short")
	}
	
	nonce, ciphertext := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, err
	}
	
	return plaintext, nil
}