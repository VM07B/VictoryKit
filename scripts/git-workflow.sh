#!/bin/bash

# ===================================
# MAULA.AI - Git Workflow Script
# ===================================

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 MAULA.AI Git Workflow${NC}"
echo "=========================="
echo ""

# ===================================
# PHASE 1: Commit and Push
# ===================================
phase1_commit() {
    echo -e "${GREEN}📦 Phase 1: Committing to main branch...${NC}"
    
    git add -A
    git commit -m "✨ Phase 1: Central Grid Station Complete

🔐 Auth Service (Port 5000)
- User model with MongoDB/Mongoose
- JWT authentication (7-day access, 30-day refresh tokens)
- BCrypt password hashing (12 rounds)
- Complete REST API: register, login, refresh, logout, me
- Express middleware for protected routes

🌉 API Gateway (Port 4000)
- http-proxy-middleware for request routing
- Rate limiting (100 req/15min)
- CORS configuration for *.maula.ai
- Health check endpoint

🎨 Main Dashboard (Port 3000)
- Next.js 14 with App Router
- React 19 + Tailwind CSS
- All 50 AI tool cards with gradients
- Responsive grid layout
- Hover animations

🚀 Infrastructure
- Docker Compose orchestration
- Nginx configs (3 domains)
- Let's Encrypt SSL automation
- MongoDB Atlas setup guide

📊 Stats: 36 files, 3500+ lines of code, 4 services"

    git push origin main
    
    echo -e "${GREEN}✅ Phase 1 committed and pushed to main!${NC}"
    echo ""
}

# ===================================
# Create Phase 2 Branch
# ===================================
create_phase2_branch() {
    echo -e "${YELLOW}🌿 Creating phase-2-fraudguard branch...${NC}"
    
    git checkout -b phase-2-fraudguard
    git push -u origin phase-2-fraudguard
    
    echo -e "${GREEN}✅ Now on phase-2-fraudguard branch!${NC}"
    echo ""
}

# ===================================
# Phase 2: Commit (run when Phase 2 complete)
# ===================================
phase2_commit() {
    echo -e "${GREEN}📦 Phase 2: Committing FraudGuard...${NC}"
    
    git add -A
    git commit -m "✨ Phase 2: FraudGuard Tool Complete

🔵 FraudGuard Frontend
- Neural Link (shared components)
- Tool-specific UI components
- Real-time fraud detection dashboard

🔴 FraudGuard API Service
- Express.js REST API
- Transaction analysis endpoints
- Risk scoring API

🟣 FraudGuard ML Engine
- Python FastAPI service
- Fraud detection models
- Real-time scoring

🟢 FraudGuard AI Assistant
- WebSocket real-time chat
- 6 LLM integrations
- Contextual fraud analysis

📊 Complete fraud detection tool ready for production"

    git push origin phase-2-fraudguard
    
    echo -e "${GREEN}✅ Phase 2 committed!${NC}"
    echo ""
}

# ===================================
# Merge Phase 2 to Main
# ===================================
merge_phase2() {
    echo -e "${YELLOW}🔀 Merging phase-2-fraudguard to main...${NC}"
    
    git checkout main
    git merge phase-2-fraudguard -m "🔀 Merge Phase 2: FraudGuard Tool"
    git push origin main
    
    echo -e "${GREEN}✅ Phase 2 merged to main!${NC}"
    echo ""
}

# ===================================
# Create Phase 3 Branch
# ===================================
create_phase3_branch() {
    echo -e "${YELLOW}🌿 Creating phase-3-mass-deploy branch...${NC}"
    
    git checkout -b phase-3-mass-deploy
    git push -u origin phase-3-mass-deploy
    
    echo -e "${GREEN}✅ Now on phase-3-mass-deploy branch!${NC}"
    echo ""
}

# ===================================
# Usage Menu
# ===================================
show_menu() {
    echo "Usage: ./git-workflow.sh [command]"
    echo ""
    echo "Commands:"
    echo "  phase1      - Commit and push Phase 1 to main"
    echo "  branch2     - Create phase-2-fraudguard branch"
    echo "  phase2      - Commit Phase 2 work"
    echo "  merge2      - Merge Phase 2 to main"
    echo "  branch3     - Create phase-3-mass-deploy branch"
    echo "  all-phase1  - Run phase1 + branch2 (start Phase 2)"
    echo "  all-phase2  - Run phase2 + merge2 + branch3 (complete Phase 2, start Phase 3)"
    echo ""
}

# ===================================
# Main
# ===================================
case "$1" in
    phase1)
        phase1_commit
        ;;
    branch2)
        create_phase2_branch
        ;;
    phase2)
        phase2_commit
        ;;
    merge2)
        merge_phase2
        ;;
    branch3)
        create_phase3_branch
        ;;
    all-phase1)
        phase1_commit
        create_phase2_branch
        echo -e "${BLUE}🎉 Ready to start Phase 2: FraudGuard!${NC}"
        ;;
    all-phase2)
        phase2_commit
        merge_phase2
        create_phase3_branch
        echo -e "${BLUE}🎉 Ready to start Phase 3: Mass Deploy!${NC}"
        ;;
    *)
        show_menu
        ;;
esac
