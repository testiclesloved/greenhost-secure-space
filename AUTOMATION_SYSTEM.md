# GreenHost Automated Storage Management System

## Overview

This system provides automated SFTP storage account creation and management through a secure API interface. It consists of three main components:

1. **Website** - Frontend interface for customers to purchase storage plans
2. **SFTP Server (sftp.go)** - Main server that manages storage accounts and users
3. **Middleman Service (middleman.go)** - Security layer that handles encrypted communication

## Architecture

```
Website → Tunneling Service → Middleman (localhost:8882) → SFTP Server (localhost:4444)
```

## Components

### 1. SFTP Server (sftp.go)
- Listens on port 4444
- Manages storage accounts and user creation
- Handles quota management
- Stores customer data in `customers/` directory
- Creates actual SFTP users and groups on the system

### 2. Middleman Service (middleman.go)
- Listens on port 8882
- Handles encryption/decryption of requests
- Acts as a secure proxy between website and SFTP server
- Uses AES-256 encryption with 32-character shared key

### 3. Website Integration
- Sends encrypted JSON requests to middleman service
- Manages customer purchases and user interface
- Handles plan selection and payment processing

## Setup Instructions

### Prerequisites
- Go 1.19+ installed
- Linux system with SFTP capabilities
- Root/sudo access for user management

### Installation

1. **Clone and build the services:**
```bash
# Build SFTP server
go build -o sftp sftp.go

# Build middleman service
go build -o middleman middleman.go
```

2. **First run - Configure server IP:**
```bash
./sftp
# You'll be prompted to enter the server IP address
# This IP will be used for SFTP links provided to customers
```

3. **Start middleman service:**
```bash
./middleman
# This will generate a 32-character encryption key
# Share this key with your website for secure communication
```

4. **Configure tunneling service:**
- Point your tunneling service to localhost:8882
- This forwards external requests to the middleman service

## API Communication

### 1. Create Storage Account

**Endpoint:** `POST /api/create-account`

**Encrypted Request:**
```json
{
  "data": "base64_encrypted_payload"
}
```

**Decrypted Payload:**
```json
{
  "company_name": "tomatoes@mail.com",
  "company_email": "tomatoes@mail.com", 
  "quota_gb": 50,
  "password": "admin_password"
}
```

**Response:** (encrypted)
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "api_key": "generated_32_char_key",
    "company_name": "tomatoes@mail.com",
    "quota_gb": 50,
    "server_ip": "your.server.ip"
  }
}
```

### 2. Add User to Account

**Endpoint:** `POST /api/add-user`

**Decrypted Payload:**
```json
{
  "company_name": "tomatoes@mail.com",
  "api_key": "company_api_key_from_step_1",
  "username": "john_doe",
  "user_email": "john@tomatoes.com",
  "password": "user_password"
}
```

**Response:** (encrypted)
```json
{
  "success": true,
  "message": "User added successfully",
  "data": {
    "username": "john_doe",
    "sftp_link": "sftp://john_doe@your.server.ip",
    "web_link": "http://your.server.ip:8080/files/john_doe",
    "server_ip": "your.server.ip"
  }
}
```

## Security Features

### Encryption
- All communication uses AES-256 encryption
- 32-character shared key between website and middleman
- Base64 encoding for transport

### Data Storage
- Customer data stored in separate JSON files
- API keys generated for each customer account
- Secure file permissions on server

### Access Control
- API key validation for all user operations
- Isolated customer environments
- SFTP user isolation with proper permissions

## File Structure

```
├── sftp.go                 # Main SFTP server
├── middleman.go           # Encryption middleman
├── server_config.json     # Server IP configuration
├── middleman_config.json  # Middleman encryption key
└── customers/             # Customer data directory
    ├── customer1_key.json
    ├── customer2_key.json
    └── ...
```

## Website Integration Example

### JavaScript Encryption Function
```javascript
async function encryptData(data, key) {
    // Implement AES-256 encryption
    // Convert to base64 for transport
    return base64EncryptedData;
}

async function createStorageAccount(companyEmail, quotaGB) {
    const payload = {
        company_name: companyEmail,
        company_email: companyEmail,
        quota_gb: quotaGB,
        password: generatePassword()
    };
    
    const encryptedPayload = await encryptData(JSON.stringify(payload), ENCRYPTION_KEY);
    
    const response = await fetch('https://your-tunnel-url/api/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: encryptedPayload })
    });
    
    const encryptedResponse = await response.json();
    const decryptedResponse = await decryptData(encryptedResponse.data, ENCRYPTION_KEY);
    
    return JSON.parse(decryptedResponse);
}
```

## Monitoring and Logs

### Server Logs
- SFTP server logs all account and user creation
- Middleman logs all encrypted requests
- Check console output for real-time monitoring

### Health Checks
```bash
# Check SFTP server
curl http://localhost:4444/health

# Check middleman service
curl http://localhost:8882/health
```

## Troubleshooting

### Common Issues

1. **Permission Denied for User Creation:**
   - Ensure the service runs with sudo privileges
   - Check system user/group creation permissions

2. **Encryption Errors:**
   - Verify the 32-character key matches on both ends
   - Check base64 encoding/decoding

3. **Connection Issues:**
   - Verify ports 4444 and 8882 are available
   - Check firewall settings
   - Ensure tunneling service is properly configured

### System Requirements
- Linux-based system (Ubuntu/Debian recommended)
- OpenSSH server installed and configured
- Go runtime environment
- Sudo/root access for user management

## Production Deployment

1. Set up proper firewall rules
2. Configure SSL/TLS for tunneling service
3. Implement log rotation
4. Set up monitoring and alerting
5. Regular backup of customer data directory
6. Implement rate limiting on API endpoints

## Support

For technical support or questions about integration, contact the development team or refer to the system logs for debugging information.