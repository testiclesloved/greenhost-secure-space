// SFTPGo API integration with encryption - matches Go implementation
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = '9__dHEdhjcXhhBlji2aGs1DZvn1p3v6t';

// Primary and fallback tunnel URLs
const PRIMARY_BASE_URL = 'http://greenhostservices.app.vtxhub.com';
const FALLBACK_BASE_URL = 'https://zda7qzpeeucs.share.zrok.io';

const TUNNEL_URL = `${PRIMARY_BASE_URL}/api/secure`;
const RESPONSE_URL = `${PRIMARY_BASE_URL}/api/response`;
const STATUS_URL = `${PRIMARY_BASE_URL}/api/status`;

const FALLBACK_TUNNEL_URL = `${FALLBACK_BASE_URL}/api/secure`;
const FALLBACK_RESPONSE_URL = `${FALLBACK_BASE_URL}/api/response`;
const FALLBACK_STATUS_URL = `${FALLBACK_BASE_URL}/api/status`;

interface EncryptedRequest {
  data: string;
  iv: string;
}

interface SFTPGoRequest {
  endpoint: string;
  method: string;
  payload: any;
  request_id: string;
}

interface CreateCompanyRequest {
  company_email: string;
  quota_gb: number;
  admin_password: string;
}

interface AddUserRequest {
  company_email: string;
  api_key: string;
  username: string;
  password: string;
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Proper AES-CBC encryption with padding (matches Go implementation)
function encryptRequest(data: SFTPGoRequest): EncryptedRequest {
  const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
  const iv = CryptoJS.lib.WordArray.random(16);
  
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return {
    data: encrypted.toString(),
    iv: iv.toString(CryptoJS.enc.Base64)
  };
}

function decryptResponse(encryptedData: string, iv: string): any {
  const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
  const ivBytes = CryptoJS.enc.Base64.parse(iv);
  
  const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
    iv: ivBytes,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
}

// Send request and poll for response (matches Go pattern) with fallback URLs
async function sendEncryptedRequest(requestData: SFTPGoRequest): Promise<any> {
  const encryptedRequest = encryptRequest(requestData);
  const urls = [TUNNEL_URL, FALLBACK_TUNNEL_URL];
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const isLastAttempt = i === urls.length - 1;
    
    try {
      console.log(`📤 Sending request to ${url === TUNNEL_URL ? 'primary' : 'fallback'}: ${requestData.request_id}`);
      
      const sendResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(encryptedRequest)
      });

      if (!sendResponse.ok) {
        throw new Error(`HTTP error! status: ${sendResponse.status}`);
      }

      const ackResp = await sendResponse.json();
      console.log(`📤 Request sent via ${url === TUNNEL_URL ? 'primary' : 'fallback'}, server acknowledged: ${ackResp.message}`);
      
      // Step 2: Poll for response using the same URL base
      return await pollForResponse(requestData.request_id, url === TUNNEL_URL ? RESPONSE_URL : FALLBACK_RESPONSE_URL);
    } catch (error) {
      console.error(`SFTPGo API Error with ${url === TUNNEL_URL ? 'primary' : 'fallback'} URL:`, error);
      
      if (isLastAttempt) {
        throw error;
      } else {
        console.log('🔄 Trying fallback URL...');
        continue;
      }
    }
  }
}

// Polling mechanism (matches Go implementation) with fallback URL support
async function pollForResponse(requestId: string, responseUrl: string = RESPONSE_URL): Promise<any> {
  const timeout = 45000; // 45 seconds
  const pollInterval = 2000; // 2 seconds
  const startTime = Date.now();
  
  console.log(`🔄 Polling for response to request ID: ${requestId} using ${responseUrl === RESPONSE_URL ? 'primary' : 'fallback'} URL`);
  
  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(responseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        console.log(`⚠️ Poll error: ${response.status}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        continue;
      }

      const responseData = await response.json();
      
      // Check if it's a timeout response
      if (responseData.timeout) {
        console.log('⏱️ Server timeout, continuing to poll...');
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        continue;
      }

      // Try to decrypt if it's an encrypted response
      if (responseData.data && responseData.iv) {
        try {
          const decryptedResult = decryptResponse(responseData.data, responseData.iv);
          
          // Check if this response matches our request ID
          if (decryptedResult.request_id === requestId) {
            console.log(`✅ Received matching response for request ID: ${requestId}`);
            return decryptedResult;
          } else {
            console.log(`📨 Received response for different request ID: ${decryptedResult.request_id} (waiting for ${requestId})`);
          }
        } catch (decryptError) {
          console.log(`⚠️ Decryption error: ${decryptError.message}, retrying...`);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.log(`⚠️ Poll error: ${error.message}, retrying...`);
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }
  
  throw new Error(`Timeout waiting for response to request ${requestId}`);
}

export async function createCompany(companyData: CreateCompanyRequest) {
  const requestData: SFTPGoRequest = {
    endpoint: '/api/create-company',
    method: 'POST',
    payload: companyData,
    request_id: generateRequestId()
  };

  return sendEncryptedRequest(requestData);
}

export async function addUser(userData: AddUserRequest) {
  const requestData: SFTPGoRequest = {
    endpoint: '/api/add-user',
    method: 'POST',
    payload: userData,
    request_id: generateRequestId()
  };

  return sendEncryptedRequest(requestData);
}

export async function getCustomer(email: string, apiKey: string) {
  const requestData: SFTPGoRequest = {
    endpoint: `/api/get-customer?email=${encodeURIComponent(email)}&api_key=${encodeURIComponent(apiKey)}`,
    method: 'GET',
    payload: {},
    request_id: generateRequestId()
  };

  return sendEncryptedRequest(requestData);
}

export async function deleteUser(companyEmail: string, apiKey: string, username: string) {
  const requestData: SFTPGoRequest = {
    endpoint: '/api/delete-user',
    method: 'DELETE',
    payload: {
      company_email: companyEmail,
      api_key: apiKey,
      username: username
    },
    request_id: generateRequestId()
  };

  return sendEncryptedRequest(requestData);
}

export async function updateQuota(companyEmail: string, apiKey: string, newQuotaGB: number) {
  const requestData: SFTPGoRequest = {
    endpoint: '/api/update-quota',
    method: 'PUT',
    payload: {
      company_email: companyEmail,
      api_key: apiKey,
      new_quota_gb: newQuotaGB
    },
    request_id: generateRequestId()
  };

  return sendEncryptedRequest(requestData);
}

export async function healthCheck() {
  const requestData: SFTPGoRequest = {
    endpoint: '/api/health',
    method: 'GET',
    payload: {},
    request_id: generateRequestId()
  };

  return sendEncryptedRequest(requestData);
}

// Simple server status check without encryption - using GET with fallback URLs
export async function checkServerStatus(): Promise<{ status: 'online' | 'offline'; message: string }> {
  const statusUrls = [STATUS_URL, FALLBACK_STATUS_URL];
  
  for (let i = 0; i < statusUrls.length; i++) {
    const url = statusUrls[i];
    const isLastAttempt = i === statusUrls.length - 1;
    
    try {
      console.log(`🔍 Checking server status via ${url === STATUS_URL ? 'primary' : 'fallback'} URL...`);
      
      const response = await fetch(url, {
        method: 'GET', // Using GET as HEAD is not supported by the tunnel
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        
        // Handle nested status structure as shown in the Go example
        let actualStatus = data;
        if (data.status && typeof data.status === 'object') {
          actualStatus = data.status;
        }
        
        if (actualStatus.online === true) {
          return {
            status: 'online',
            message: `Server is online and ready via ${url === STATUS_URL ? 'primary' : 'fallback'}. Queue size: ${actualStatus.queue_size || 'N/A'}`
          };
        } else {
          return {
            status: 'offline',
            message: data.message || 'Server status unknown'
          };
        }
      } else {
        if (isLastAttempt) {
          return {
            status: 'offline',
            message: `Server returned status: ${response.status}`
          };
        } else {
          console.log(`⚠️ Primary server returned ${response.status}, trying fallback...`);
          continue;
        }
      }
    } catch (error) {
      console.error(`Error checking ${url === STATUS_URL ? 'primary' : 'fallback'} server:`, error);
      
      if (isLastAttempt) {
        return {
          status: 'offline',
          message: error instanceof Error ? error.message : 'Connection failed'
        };
      } else {
        console.log('🔄 Trying fallback URL...');
        continue;
      }
    }
  }

  return {
    status: 'offline',
    message: 'All servers unreachable'
  };
}