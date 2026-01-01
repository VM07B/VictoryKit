#!/bin/bash

# Redeploy Main Dashboard Script
# Ensures the correct Next.js dashboard is deployed to maula.ai

set -e

EC2_HOST="ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com"
EC2_KEY="/workspaces/VictoryKit/victorykit.pem"

echo "🚀 Redeploying main dashboard to maula.ai..."

# Ensure SSH key has correct permissions
chmod 600 "$EC2_KEY" 2>/dev/null || true

echo "📦 Step 1: Updating repository on EC2..."
ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "
    set -e
    cd /var/www/maula.ai/repo
    git fetch origin
    git reset --hard origin/main
    git pull origin main
    echo 'Repository updated!'
"

echo "🏗️ Step 2: Rebuilding the main dashboard..."
ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "
    set -e
    
    # Load NVM
    export NVM_DIR=\"/home/ubuntu/.nvm\"
    [ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\"
    
    cd /var/www/maula.ai/repo/frontend/main-dashboard
    
    echo 'Installing dependencies...'
    npm install
    
    echo 'Building Next.js app...'
    npm run build
    
    echo 'Copying build to live directory...'
    sudo rm -rf /var/www/maula.ai/live/*
    
    if [ -d 'out' ]; then
        sudo cp -r out/. /var/www/maula.ai/live/
        echo '✅ Static export (out/) deployed'
    else
        echo '❌ No out/ directory found - checking package.json build config'
        cat package.json | grep -A5 'scripts'
    fi
    
    ls -la /var/www/maula.ai/live/ | head -10
"

echo "🔄 Step 3: Restarting dashboard service..."
ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "
    sudo systemctl restart dashboard
    sleep 3
    sudo systemctl status dashboard --no-pager | head -15
"

echo "✅ Step 4: Testing deployment..."
ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "
    curl -s http://localhost:3000 | head -20
"

echo ""
echo "🎉 Redeployment complete! Check https://maula.ai"
