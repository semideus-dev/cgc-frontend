# API Testing Guide

## Backend API URL
Your backend API is running at: `https://bold-helpful-gull.ngrok-free.app`

## Testing Methods

### 1. Using cURL (Command Line)

#### Health Check
```bash
curl -H "ngrok-skip-browser-warning: true" \
     https://bold-helpful-gull.ngrok-free.app/health
```

#### GET Request Example
```bash
curl -H "ngrok-skip-browser-warning: true" \
     -H "Content-Type: application/json" \
     https://bold-helpful-gull.ngrok-free.app/api/endpoint
```

#### POST Request Example
```bash
curl -X POST \
     -H "ngrok-skip-browser-warning: true" \
     -H "Content-Type: application/json" \
     -d '{"key": "value"}' \
     https://bold-helpful-gull.ngrok-free.app/api/endpoint
```

#### With Authentication (if needed)
```bash
curl -H "ngrok-skip-browser-warning: true" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     https://bold-helpful-gull.ngrok-free.app/api/protected-endpoint
```

### 2. Using Postman

1. **Install Postman**: Download from https://www.postman.com/
2. **Create New Request**
3. **Set Headers**:
   - `Content-Type: application/json`
   - `ngrok-skip-browser-warning: true` (for ngrok)
4. **Set URL**: `https://bold-helpful-gull.ngrok-free.app/api/your-endpoint`
5. **Add Body** (for POST/PUT requests): Select "raw" and "JSON"

### 3. Using Thunder Client (VS Code Extension)

1. **Install Thunder Client** extension in VS Code
2. **Create New Request**
3. **Set URL and Headers** as above
4. **Send Request**

### 4. Using JavaScript/Axios (Frontend)

```javascript
// Test API endpoint from browser console or component
const testApi = async () => {
  try {
    const response = await fetch('https://bold-helpful-gull.ngrok-free.app/health', {
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    console.log('API Response:', data);
  } catch (error) {
    console.error('API Error:', error);
  }
};

// Call the function
testApi();
```

### 5. Using Your Axios Client

```javascript
import { apiClient } from '@/lib/axios-client';

// Test in a component or console
const testBackend = async () => {
  try {
    const response = await apiClient.get('/health');
    console.log('Backend response:', response.data);
  } catch (error) {
    console.error('Backend error:', error);
  }
};
```

## Common API Endpoints to Test

### Health Check
- **URL**: `/health`
- **Method**: GET
- **Expected**: `{"status": "ok"}` or similar

### Documentation
- **URL**: `/docs` (FastAPI auto-generated docs)
- **Method**: GET
- **Expected**: Swagger UI documentation

### User Endpoints (examples)
- **GET** `/api/users` - Get all users
- **POST** `/api/users` - Create user
- **GET** `/api/users/{id}` - Get user by ID
- **PUT** `/api/users/{id}` - Update user
- **DELETE** `/api/users/{id}` - Delete user

### Analysis Endpoints (examples)
- **POST** `/api/analysis` - Create analysis
- **GET** `/api/analysis` - Get all analyses
- **GET** `/api/analysis/{id}` - Get analysis by ID

## Troubleshooting

### ngrok Issues
If you get browser warnings with ngrok, always include:
```
ngrok-skip-browser-warning: true
```

### CORS Issues
If you get CORS errors, make sure your backend allows:
- Origin: `http://localhost:3000`
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Headers: Content-Type, Authorization, ngrok-skip-browser-warning

### Authentication Issues
- Check if endpoints require authentication
- Verify token format and expiration
- Ensure proper Authorization header format

## Quick Test Script

Create a test file to quickly check all endpoints:

```javascript
// test-api.js
const baseURL = 'https://bold-helpful-gull.ngrok-free.app';

const testEndpoints = async () => {
  const endpoints = [
    { method: 'GET', url: '/health' },
    { method: 'GET', url: '/docs' },
    // Add your endpoints here
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseURL}${endpoint.url}`, {
        method: endpoint.method,
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ ${endpoint.method} ${endpoint.url}:`, response.status);
    } catch (error) {
      console.log(`❌ ${endpoint.method} ${endpoint.url}:`, error.message);
    }
  }
};

testEndpoints();
```

Run this in your browser console or as a Node.js script to test multiple endpoints quickly.