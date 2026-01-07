# API Specifications

## Base URL
```
Development: http://localhost:3000
Production: Set via VITE_API_URL
```

## Authentication
Most endpoints require Bearer token in header:
```
Authorization: Bearer <jwt_token>
```

---

## Auth Endpoints

### POST /auth/register
Register a new user.

**Request Body:**
```typescript
{
  email: string;    // Unique email
  password: string; // Min 8 characters
}
```

**Success Response (201):**
```typescript
{
  message: string;
  user: {
    id: string;
    email: string;
    is2FAEnabled: boolean;
  }
}
```

**Error Response (400):**
```typescript
{
  statusCode: 400;
  message: string[];  // Validation errors
  error: string;
}
```

---

### POST /auth/login
Login with email and password.

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Success Response (200):**
```typescript
{
  token: string;           // JWT token
  requires2FA: boolean;    // true if user has 2FA enabled
  user: {
    id: string;
    email: string;
  }
}
```

**Error Response (401):**
```typescript
{
  statusCode: 401;
  message: "Invalid credentials";
}
```

---

### POST /auth/verify-otp
Verify OTP code after login (if 2FA enabled).

**Headers:**
```
Authorization: Bearer <token_from_login>
```

**Request Body:**
```typescript
{
  otp: string;  // 6-digit code
}
```

**Success Response (200):**
```typescript
{
  accessToken: string;  // Full access token
  user: {
    id: string;
    email: string;
  }
}
```

**Error Response (401):**
```typescript
{
  statusCode: 401;
  message: "Invalid OTP code";
}
```

---

## TOTP Endpoints
All TOTP endpoints require authentication.

### GET /totp/setup
Generate a new TOTP secret and QR code for setup.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```typescript
{
  secret: string;      // TOTP secret (keep safe!)
  qrCodeUrl: string;   // otpauth:// URL for QR code
}
```

---

### POST /totp/enable
Enable 2FA by verifying the first OTP code.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  secret: string;  // Secret from /totp/setup
  otp: string;     // 6-digit code from authenticator
  deviceName: string;  // e.g., "iPhone 15", "iPad"
}
```

**Success Response (201):**
```typescript
{
  message: string;
  device: {
    id: string;
    name: string;
    createdAt: string;
  }
}
```

---

### POST /totp/disable
Disable 2FA (requires OTP verification).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  otp: string;  // Current 6-digit code
}
```

**Success Response (200):**
```typescript
{
  message: "2FA disabled successfully";
}
```

---

### GET /totp/devices
List all authenticator devices.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```typescript
{
  devices: Array<{
    id: string;
    name: string;
    createdAt: string;
    lastUsedAt: string | null;
  }>;
}
```

---

### POST /totp/devices
Add a new authenticator device.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  secret: string;     // From new /totp/setup call
  otp: string;        // 6-digit code
  deviceName: string; // Device name
}
```

**Success Response (201):**
```typescript
{
  message: string;
  device: {
    id: string;
    name: string;
    createdAt: string;
  }
}
```

---

### DELETE /totp/devices/:id
Remove an authenticator device.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```typescript
{
  message: "Device removed successfully";
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid credentials/OTP) |
| 404 | Not Found |
| 500 | Internal Server Error |
