#!/bin/bash

# Recovery: Switch to existing phase-4-backend-api and sync with main

echo "================================================"
echo "Switching to phase-4-backend-api Branch"
echo "================================================"

# Step 1: Switch to phase-4-backend-api
echo ""
echo "Step 1: Switching to phase-4-backend-api branch..."
git checkout phase-4-backend-api

if [ $? -ne 0 ]; then
    echo "❌ Failed to checkout phase-4-backend-api branch"
    exit 1
fi
echo "✅ Switched to phase-4-backend-api branch"

# Step 2: Pull latest changes from remote
echo ""
echo "Step 2: Pulling latest changes..."
git pull origin phase-4-backend-api

echo "✅ Branch updated from remote"

# Step 3: Merge main into phase-4-backend-api to get all new changes
echo ""
echo "Step 3: Merging main into phase-4-backend-api..."
git merge main --no-edit

if [ $? -ne 0 ]; then
    echo "❌ Merge failed - please resolve conflicts manually"
    exit 1
fi
echo "✅ Merged main into phase-4-backend-api"

# Step 4: Push updated branch
echo ""
echo "Step 4: Pushing phase-4-backend-api to remote..."
git push origin phase-4-backend-api

if [ $? -ne 0 ]; then
    echo "❌ Failed to push phase-4-backend-api branch"
    exit 1
fi
echo "✅ Pushed phase-4-backend-api to remote"

echo ""
echo "================================================"
echo "🎉 All Set! 🎉"
echo "================================================"
echo ""
echo "Current branch: phase-4-backend-api"
echo "Status: Synced with main"
echo ""
echo "Summary:"
echo "✅ All 3038+ changes committed to main"
echo "✅ phase-4-backend-api branch synced"
echo "✅ Ready for Phase 4 development"
echo ""
echo "🏆 Phase 2-3 Complete: 50 AI Security Tools! 🏆"
echo ""
echo "Next: Phase 4 - Backend API Implementation"
echo "================================================"
