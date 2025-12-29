#!/bin/bash

# Commit Phase 4: Shared Utilities & Core Models

echo "================================================"
echo "Committing Phase 4: Shared Backend Infrastructure"
echo "================================================"

# Add all new files
git add backend/shared/

# Commit
git commit -m "feat: Phase 4 - Shared Backend Infrastructure

Implemented shared utilities and core models for all 50 tools

Shared Utilities:
✅ API Error handling (ApiError class with factory methods)
✅ API Response formatting (standardized responses)
✅ Winston logger (file + console logging)
✅ Error handler middleware (global error handling)
✅ Auth middleware (JWT validation, role/permission checks)
✅ Rate limiter middleware (auth, API, public, ML tiers)
✅ Validation middleware (express-validator integration)
✅ Database connection utility (MongoDB + Mongoose)
✅ Application constants (roles, permissions, status codes)

Core Models:
✅ User model (authentication, authorization, account locking)
✅ Session model (JWT sessions, TTL, activity tracking)

Features:
- JWT authentication with role-based access control (RBAC)
- Permission-based authorization
- Rate limiting (tiered: auth/API/public/ML)
- Account locking after failed login attempts
- Session management with auto-expiry
- Comprehensive error handling
- Structured logging
- Input validation

Ready for:
- Auth service implementation
- API Gateway setup
- Tool-specific backend APIs

Next: Implement Auth Service & API Gateway"

if [ $? -eq 0 ]; then
    echo "✅ Shared infrastructure committed successfully"
else
    echo "❌ Commit failed"
    exit 1
fi

echo ""
echo "================================================"
echo "📊 Phase 4 Progress"
echo "================================================"
echo "✅ Shared utilities (9 files)"
echo "✅ Core models (2 files)"
echo "⏳ Auth service (next)"
echo "⏳ API Gateway (next)"
echo "⏳ Tool APIs (50 tools)"
echo "================================================"
