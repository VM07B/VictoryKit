#!/bin/bash

# Quick test script for VictoryKit APIs

echo "🧪 Testing VictoryKit APIs"
echo "=========================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

test_endpoint() {
    local name=$1
    local url=$2
    
    echo -n "Testing $name... "
    
    if response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null); then
        status_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | head -n-1)
        
        if [ "$status_code" = "200" ]; then
            echo -e "${GREEN}✅ OK${NC} ($status_code)"
            echo "   Response: $(echo $body | jq -r '.status // .message // .' 2>/dev/null || echo $body | head -c 50)"
        else
            echo -e "${RED}❌ FAIL${NC} ($status_code)"
        fi
    else
        echo -e "${RED}❌ UNREACHABLE${NC}"
    fi
}

echo ""
echo "Health Checks:"
test_endpoint "MalwareHunter API" "http://localhost:4004/health"
test_endpoint "PhishGuard API   " "http://localhost:4005/health"
test_endpoint "VulnScan API     " "http://localhost:4006/health"
test_endpoint "API Gateway      " "http://localhost:4000/health"
test_endpoint "Auth Service     " "http://localhost:5000/health"

echo ""
echo "=========================="
echo "📝 Next steps:"
echo "   1. Register user:  curl -X POST http://localhost:5000/api/v1/auth/register -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"password\":\"Test123!\",\"name\":\"Test User\"}'"
echo "   2. Login:          curl -X POST http://localhost:5000/api/v1/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"password\":\"Test123!\"}'"
echo "   3. Use the token in Authorization: Bearer <token> header"
echo ""
