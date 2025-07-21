// SFTPGo API integration with encryption
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = '9__dHEdhjcXhhBlji2aGs1DZvn1p3v6t';
const TUNNEL_URL = 'https://zda7qzpeeucs.share.zrok.io';

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

function encryptRequest(data: SFTPGoRequest): EncryptedRequest {
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY, {
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
  const ivBytes = CryptoJS.enc.Base64.parse(iv);
  const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY, {
    iv: ivBytes,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
}

async function sendEncryptedRequest(requestData: SFTPGoRequest): Promise<any> {
  try {
    const encryptedRequest = encryptRequest(requestData);
    
    const response = await fetch(`${TUNNEL_URL}/api/secure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(encryptedRequest)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const encryptedResponse = await response.json();
    
    if (encryptedResponse.data && encryptedResponse.iv) {
      return decryptResponse(encryptedResponse.data, encryptedResponse.iv);
    }
    
    return encryptedResponse;
  } catch (error) {
    console.error('SFTPGo API Error:', error);
    throw error;
  }
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