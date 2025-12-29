#!/bin/bash

# Commit Payment System

echo "================================================"
echo "Committing Simple Tool Access Payment System"
echo "================================================"

# Add files
git add backend/shared/models/ToolAccess.model.js
git add backend/shared/middleware/toolAccess.middleware.js
git add backend/central-grid/auth-service/src/controllers/payment.controller.js
git add backend/central-grid/auth-service/src/routes/payment.routes.js
git add backend/central-grid/auth-service/src/server.js
git add backend/central-grid/auth-service/package.json
git add backend/central-grid/auth-service/.env.example
git add backend/central-grid/api-gateway/src/routes/gateway.routes.js

# Commit
git commit -m "feat: Simple Pay-Per-Tool Access System

$1 for 24-hour access to any tool - Super simple payment model

Payment Model:
✅ $1 USD = 24 hours access to ONE tool
✅ No subscriptions, no renewals, no trials
✅ No upgrades, no downgrades, no cancels
✅ No refunds, no returns
✅ One-time payment per tool
✅ Can buy multiple tools, each costs $1 separately
✅ Access expires exactly 24 hours after purchase

Database Model:
✅ ToolAccess - Track user access to each tool
   - userId, toolId, paymentId
   - purchasedAt, expiresAt (24h auto-expire)
   - isActive, isExpired, remainingTime
   - Stripe payment integration

Middleware:
✅ checkToolAccess - Verify user has paid for tool
✅ Automatic expiration checking
✅ Admin bypass (admins have access to all tools)

Payment Controller (6 endpoints):
- POST /api/v1/payment/purchase - Buy tool access ($1 payment intent)
- POST /api/v1/payment/confirm - Confirm payment & grant access
- GET  /api/v1/payment/my-access - Get my active tool access
- GET  /api/v1/payment/check-access/:toolId - Check access to specific tool
- GET  /api/v1/payment/tools - Get all 50 tools with access status
- GET  /api/v1/payment/history - Get payment history

Features:
✅ Stripe integration for $1 payments
✅ Automatic 24-hour expiration
✅ Access validation on every API request
✅ Payment history tracking
✅ Active access dashboard
✅ Remaining time calculation
✅ Prevent duplicate purchases (check existing access)
✅ IP address and user agent tracking

API Gateway Updates:
✅ Access control on all tool routes
✅ Payment routes proxied to auth service
✅ Automatic access verification

Flow:
1. User clicks 'Buy Access' on any tool → POST /payment/purchase
2. Frontend shows Stripe payment form with $1 charge
3. User completes payment
4. Frontend calls POST /payment/confirm with paymentIntentId
5. System creates ToolAccess record with 24h expiration
6. User can now access the tool for exactly 24 hours
7. After 24h, access automatically expires
8. User must pay another $1 for another 24h

Example: User wants to use 3 tools today
- Pays $1 for FraudGuard → 24h access
- Pays $1 for VulnScan → 24h access  
- Pays $1 for PhishGuard → 24h access
- Total: $3 for 24h access to 3 tools

All 50 Tools Available:
Each tool costs $1 for 24 hours
Each purchase is independent
No package deals, no bundles
Super simple pricing

Integration Ready:
✅ Stripe Secret Key in .env
✅ Payment routes protected with auth
✅ Access middleware on all tool APIs
✅ Frontend can integrate Stripe Elements

Next: Frontend payment integration with Stripe Elements"

if [ $? -eq 0 ]; then
    echo "✅ Payment system committed successfully"
else
    echo "❌ Commit failed"
    exit 1
fi

echo ""
echo "================================================"
echo "💰 Payment System Summary"
echo "================================================"
echo "Price per tool: $1 USD"
echo "Access duration: 24 hours"
echo "Total tools: 50"
echo "Payment processor: Stripe"
echo ""
echo "User Experience:"
echo "1. Browse 50 AI security tools"
echo "2. Click any tool → 'Buy 24h access for $1'"
echo "3. Pay $1 via Stripe"
echo "4. Get instant 24-hour access"
echo "5. Access expires automatically after 24h"
echo "6. Want to use again? Pay $1 for another 24h"
echo ""
echo "Super Simple. No Complexity. Just $1 = 24 hours."
echo "================================================"
