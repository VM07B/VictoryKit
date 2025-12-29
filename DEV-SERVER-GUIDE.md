# VictoryKit API Testing Guide

## Quick Start Dev Server

### 1. Start All Services

```bash
chmod +x start-dev-server.sh
./start-dev-server.sh
```

This will start:
- **MongoDB** (Docker container on port 27017)
- **Auth Service** (port 5000)
- **API Gateway** (port 4000)
- **MalwareHunter API** (port 4004)
- **PhishGuard API** (port 4005)
- **VulnScan API** (port 4006)

### 2. Test Health Endpoints

```bash
chmod +x test-apis.sh
./test-apis.sh
```

## Manual Testing

### Register a User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@victorykit.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@victorykit.com",
    "password": "SecurePass123!"
  }'
```

Save the `token` from the response.

### Test MalwareHunter API

```bash
# Set your token
TOKEN="your-jwt-token-here"

# Upload and analyze a malware sample
curl -X POST http://localhost:4004/api/v1/malwarehunter/samples/upload \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "fileName": "suspicious.exe",
    "fileSize": 524288,
    "fileType": "exe",
    "mimeType": "application/x-msdownload",
    "fileData": "TVqQAAMAAAAEAAAA//8AALgAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAA4fug4AtAnNIbgBTM0hVGhpcyBwcm9ncmFtIGNhbm5vdCBiZSBydW4gaW4gRE9TIG1vZGUuDQ0KJAAAAAAAAABQRQAAyw=="
  }'

# Get all samples
curl http://localhost:4004/api/v1/malwarehunter/samples \
  -H "Authorization: Bearer $TOKEN"

# Get statistics
curl http://localhost:4004/api/v1/malwarehunter/samples/statistics \
  -H "Authorization: Bearer $TOKEN"
```

### Test PhishGuard API

```bash
# Check a URL for phishing
curl -X POST http://localhost:4005/api/v1/phishguard/urls/check \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://paypa1-secure-login-verify.suspicious-domain.com/signin"
  }'

# Batch check multiple URLs
curl -X POST http://localhost:4005/api/v1/phishguard/urls/batch \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "urls": [
      "https://google.com",
      "https://amaz0n-account-verify.phishing-site.com",
      "https://github.com"
    ]
  }'

# Get all checked URLs
curl http://localhost:4005/api/v1/phishguard/urls \
  -H "Authorization: Bearer $TOKEN"
```

### Test VulnScan API

```bash
# Start a vulnerability scan
curl -X POST http://localhost:4006/api/v1/vulnscan/scans \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "targetType": "web_application",
    "targetIdentifier": "https://example.com",
    "scanType": "quick"
  }'

# Get all scans
curl http://localhost:4006/api/v1/vulnscan/scans \
  -H "Authorization: Bearer $TOKEN"

# Get scan statistics
curl http://localhost:4006/api/v1/vulnscan/scans/statistics \
  -H "Authorization: Bearer $TOKEN"
```

## Service Ports

| Service | Port | Purpose |
|---------|------|---------|
| Auth Service | 5000 | User authentication & payments |
| API Gateway | 4000 | Unified entry point (with tool access control) |
| MalwareHunter | 4004 | Malware analysis & detection |
| PhishGuard | 4005 | Phishing URL detection |
| VulnScan | 4006 | Vulnerability scanning |

## Payment Flow

To access a tool, you need to purchase 24-hour access ($1 per tool):

```bash
# Purchase tool access
curl -X POST http://localhost:5000/api/v1/payment/purchase \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "toolId": "04-malwarehunter"
  }'

# This returns a Stripe payment intent. In production, complete payment via Stripe.
# For testing, you can confirm it directly:

curl -X POST http://localhost:5000/api/v1/payment/confirm \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "toolId": "04-malwarehunter",
    "paymentIntentId": "payment-intent-id-from-previous-call"
  }'

# Check your tool access
curl http://localhost:5000/api/v1/payment/my-access \
  -H "Authorization: Bearer $TOKEN"
```

## Stopping Services

```bash
# Stop all Node.js servers
pkill -f 'node.*server.js'

# Stop MongoDB container
docker stop victorykit-mongodb
docker rm victorykit-mongodb
```

## Monitoring

```bash
# View MongoDB container logs
docker logs victorykit-mongodb -f

# Check running processes
ps aux | grep node

# Check open ports
lsof -i :4000,4004,4005,4006,5000
```

## Troubleshooting

### MongoDB Connection Issues

```bash
# Restart MongoDB
docker restart victorykit-mongodb

# Or remove and recreate
docker rm -f victorykit-mongodb
docker run -d -p 27017:27017 --name victorykit-mongodb mongo:7
```

### Port Already in Use

```bash
# Find process using port
lsof -ti:4004

# Kill the process
kill -9 $(lsof -ti:4004)
```

### Missing Dependencies

```bash
# Reinstall for specific tool
cd backend/tools/04-malwarehunter/api
rm -rf node_modules package-lock.json
npm install
```

## Development Tips

- **Hot reload**: Use `npm run dev` (with nodemon) instead of `npm start`
- **View logs**: Each API logs to console with Winston
- **Database**: Use MongoDB Compass to view data: `mongodb://localhost:27017`
- **API docs**: Each tool's endpoints are defined in `routes/index.js`

## Next Steps

1. ✅ All 3 tool APIs running (MalwareHunter, PhishGuard, VulnScan)
2. 🔄 Complete remaining tools 07-10 (PenTestAI, SecureCode, ComplianceCheck, DataGuardian)
3. 🎨 Connect frontend dashboard
4. 🧪 Add comprehensive test suites
5. 📊 Integrate real ML engines
6. 🚀 Production deployment
