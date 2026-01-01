#!/bin/bash

# ===================================
# MAULA.AI - Phase 1 Test Script
# ===================================

echo "🧪 Testing MAULA.AI Phase 1 Services"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test Auth Service
echo "1️⃣  Testing Auth Service (Port 5000)..."
AUTH_HEALTH=$(curl -s http://localhost:5000/health)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Auth Service is running${NC}"
    echo "   Response: $AUTH_HEALTH"
else
    echo -e "${RED}❌ Auth Service is NOT running${NC}"
    echo -e "${YELLOW}   Start it with: cd backend/shared-services/auth-service && npm run dev${NC}"
fi
echo ""

# Test API Gateway
echo "2️⃣  Testing API Gateway (Port 4000)..."
GATEWAY_HEALTH=$(curl -s http://localhost:4000/health)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ API Gateway is running${NC}"
    echo "   Response: $GATEWAY_HEALTH"
else
    echo -e "${RED}❌ API Gateway is NOT running${NC}"
    echo -e "${YELLOW}   Start it with: cd backend/shared-services/api-gateway && npm run dev${NC}"
fi
echo ""

# Test Main Dashboard
echo "3️⃣  Testing Main Dashboard (Port 3000)..."
DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$DASHBOARD_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Main Dashboard is running${NC}"
    echo "   Visit: http://localhost:3000"
else
    echo -e "${RED}❌ Main Dashboard is NOT running${NC}"
    echo -e "${YELLOW}   Start it with: cd frontend/main-dashboard && npm run dev${NC}"
fi
echo ""

# Test MongoDB
echo "4️⃣  Testing MongoDB Connection..."
if command -v mongosh &> /dev/null; then
    MONGO_TEST=$(mongosh --quiet --eval "db.version()" 2>&1)
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ MongoDB is running${NC}"
        echo "   Version: $MONGO_TEST"
    else
        echo -e "${RED}❌ MongoDB is NOT running${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  mongosh not installed, skipping MongoDB test${NC}"
    echo "   Using MongoDB Atlas? Check connection in .env file"
fi
echo ""

# Test Auth Registration
echo "5️⃣  Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@maula.ai",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User"
  }')

if echo "$REGISTER_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Registration endpoint working${NC}"
    echo "   User created: test@maula.ai"
else
    echo -e "${YELLOW}⚠️  Registration response: $REGISTER_RESPONSE${NC}"
    echo "   (User might already exist - this is OK)"
fi
echo ""

# Test Auth Login
echo "6️⃣  Testing User Login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@maula.ai",
    "password": "TestPass123!"
  }')

if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
    echo -e "${GREEN}✅ Login endpoint working${NC}"
    
    # Extract token
    ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    echo "   Access token received (first 20 chars): ${ACCESS_TOKEN:0:20}..."
    
    # Test protected endpoint
    echo ""
    echo "7️⃣  Testing Protected Endpoint (/api/auth/me)..."
    ME_RESPONSE=$(curl -s http://localhost:5000/api/auth/me \
      -H "Authorization: Bearer $ACCESS_TOKEN")
    
    if echo "$ME_RESPONSE" | grep -q "test@maula.ai"; then
        echo -e "${GREEN}✅ Protected endpoint working${NC}"
        echo "   User data retrieved successfully"
    else
        echo -e "${RED}❌ Protected endpoint failed${NC}"
        echo "   Response: $ME_RESPONSE"
    fi
else
    echo -e "${RED}❌ Login failed${NC}"
    echo "   Response: $LOGIN_RESPONSE"
fi
echo ""

# Test API Gateway Proxy
echo "8️⃣  Testing API Gateway Proxy..."
GATEWAY_LOGIN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@maula.ai",
    "password": "TestPass123!"
  }')

if echo "$GATEWAY_LOGIN" | grep -q "accessToken"; then
    echo -e "${GREEN}✅ API Gateway proxy working${NC}"
    echo "   Successfully proxied login request"
else
    echo -e "${RED}❌ API Gateway proxy failed${NC}"
    echo "   Response: $GATEWAY_LOGIN"
fi
echo ""

# Summary
echo "======================================"
echo "📊 Test Summary"
echo "======================================"
echo ""
echo "Services to access:"
echo "  🌐 Main Dashboard:  http://localhost:3000"
echo "  🔐 Auth Service:    http://localhost:5000"
echo "  🌉 API Gateway:     http://localhost:4000"
echo ""
echo "Test user credentials:"
echo "  📧 Email:     test@maula.ai"
echo "  🔑 Password:  TestPass123!"
echo ""
echo "Next steps:"
echo "  1. Open http://localhost:3000 in your browser"
echo "  2. See all 50 tool cards on the homepage"
echo "  3. Proceed to Phase 2: Build FraudGuard tool"
echo ""
echo "🎉 Phase 1 Testing Complete!"
