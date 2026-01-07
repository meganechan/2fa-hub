# Environment Variables

## Backend Environment Variables

### Database
```bash
MONGODB_URI=mongodb://localhost:27017/2fa-hub
```
- MongoDB connection string
- Default: `mongodb://localhost:27017/2fa-hub`
- Production: Use MongoDB Atlas or dedicated server

### JWT Authentication
```bash
JWT_SECRET=your-jwt-secret-change-this-in-production
JWT_EXPIRES_IN=7d
```
- `JWT_SECRET`: Secret key for signing JWT tokens (use strong random string)
- `JWT_EXPIRES_IN`: Token expiration time (e.g., `7d`, `24h`, `30m`)

### Server
```bash
PORT=3000
```
- Backend server port
- Default: `3000`

### Encryption (TOTP Secrets)
```bash
ENCRYPTION_KEY=your-32-char-encryption-key-here-change
```
- AES-256 encryption key for TOTP secrets
- **MUST be exactly 32 characters** (256 bits)
- Generate with: `openssl rand -base64 32 | head -c32`

---

## Frontend Environment Variables

### API URL
```bash
VITE_API_URL=http://localhost:3000
```
- Backend API base URL
- Development: `http://localhost:3000`
- Production: Actual backend URL (e.g., `https://api.2fahub.com`)

---

## Generating Secure Keys

### JWT Secret
```bash
# Generate random 64-character secret
openssl rand -base64 64
```

### Encryption Key (32 characters)
```bash
# Method 1: Random string
openssl rand -base64 32 | head -c32

# Method 2: Using Python
python3 -c "import secrets; print(secrets.token_urlsafe(24)[:32])"
```

---

## Environment Files

### `.env.example` (Template)
```bash
# Copy this to .env and fill in your values
MONGODB_URI=mongodb://localhost:27017/2fa-hub
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d
PORT=3000
ENCRYPTION_KEY=your-32-char-encryption-key-here
VITE_API_URL=http://localhost:3000
```

### `.env` (Local Development - DO NOT COMMIT)
```bash
MONGODB_URI=mongodb://localhost:27017/2fa-hub
JWT_SECRET=local-dev-secret-do-not-use-in-production
JWT_EXPIRES_IN=7d
PORT=3000
ENCRYPTION_KEY=local-dev-encryption-key-32chars
VITE_API_URL=http://localhost:3000
```

### `.env.production` (Production)
```bash
MONGODB_URI=mongodb+srv://user:password@cluster.example.com/2fa-hub
JWT_SECRET=<generated-secure-secret>
JWT_EXPIRES_IN=7d
PORT=3000
ENCRYPTION_KEY=<generated-32-char-key>
```

---

## Coolify Environment Variables

### Backend Service
Set these in Coolify's environment variables section:

```bash
MONGODB_URI=mongodb://user:password@mongodb-service:27017/2fa-hub
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRES_IN=7d
PORT=3000
ENCRYPTION_KEY=your-production-encryption-key-32chars
NODE_ENV=production
```

### Frontend Service
```bash
VITE_API_URL=https://your-backend-url.com
```

---

## Security Checklist

- [ ] Never commit `.env` files to version control
- [ ] Add `.env` to `.gitignore`
- [ ] Use different secrets for development and production
- [ ] Rotate secrets periodically (recommended: every 90 days)
- [ ] Store production secrets in secure vault (Coolify handles this)
- [ ] Use strong, randomly generated secrets (minimum 32 characters)
- [ ] Ensure `ENCRYPTION_KEY` is exactly 32 characters

---

## Current Local Development Values

```bash
MongoDB Container: mongodb
MongoDB Port: 27017
Database: 2fa-hub
Backend Port: 3000
Frontend Port: 5173
```
