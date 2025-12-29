#!/bin/bash

# Commit Auth Service & API Gateway

echo "================================================"
echo "Committing Auth Service & API Gateway"
echo "================================================"

# Add files
git add backend/central-grid/

# Commit
git commit -m "feat: Auth Service & API Gateway implementation

Complete authentication system and API gateway for 50 tools

Auth Service (Port 5000):
✅ User registration with validation
✅ Login with account locking (5 failed attempts)
✅ JWT token generation and management
✅ Session management with TTL
✅ Password reset flow
✅ Profile management
✅ Multi-session tracking
✅ Rate limiting (5 auth attempts per 15min)

API Endpoints:
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- GET  /api/v1/auth/profile
- PUT  /api/v1/auth/profile
- POST /api/v1/auth/change-password
- POST /api/v1/auth/request-password-reset
- POST /api/v1/auth/reset-password
- POST /api/v1/auth/verify-session
- GET  /api/v1/auth/sessions
- DELETE /api/v1/auth/sessions/:id

API Gateway (Port 4000):
✅ Centralized routing to 50 microservices
✅ JWT validation for all tool APIs
✅ Request proxying with user context forwarding
✅ Rate limiting (100 requests per 15min)
✅ Error handling for service unavailability
✅ Health checks

Tool Routes:
- /api/v1/fraudguard/* → Port 4001
- /api/v1/intelliscout/* → Port 4002
- /api/v1/threatradar/* → Port 4003
... (all 50 tools)
- /api/v1/cyberthreatmap/* → Port 4050

Security Features:
- Password requirements (8+ chars, upper, lower, number)
- Account locking after failed attempts
- Session expiration (7 days)
- Password reset tokens (30min expiry)
- Rate limiting (tiered)
- CORS protection
- Helmet security headers
- Request logging

Infrastructure:
✅ Docker support
✅ Health check endpoints
✅ Environment configuration
✅ Production-ready logging
✅ Error handling
✅ Input validation

Ready for: Tool-specific backend API implementation

Next: Implement FraudGuard backend API (first tool)"

if [ $? -eq 0 ]; then
    echo "✅ Auth Service & API Gateway committed"
else
    echo "❌ Commit failed"
    exit 1
fi

echo ""
echo "================================================"
echo "📊 Phase 4 Progress"
echo "================================================"
echo "✅ Shared utilities (11 files)"
echo "✅ Auth Service (7 files)"
echo "✅ API Gateway (5 files)"
echo "⏳ Tool APIs - 0/50 tools"
echo ""
echo "Next: Implement Tool Backend APIs"
echo "Starting with: FraudGuard (Tool 01)"
echo "================================================"
