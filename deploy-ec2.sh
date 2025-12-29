#!/bin/bash

# ============================================
# VictoryKit EC2 Deployment Script
# ============================================

EC2_HOST="ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com"
EC2_USER="ubuntu"
PEM_FILE="victorykit.pem"
APP_DIR="/home/ubuntu/victorykit"

echo "🚀 VictoryKit EC2 Deployment"
echo "============================"

# Check PEM file
if [ ! -f "$PEM_FILE" ]; then
    echo "❌ PEM file not found: $PEM_FILE"
    exit 1
fi

chmod 400 $PEM_FILE

# SSH function
ssh_cmd() {
    ssh -i $PEM_FILE -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST "$1"
}

# SCP function  
scp_cmd() {
    scp -i $PEM_FILE -o StrictHostKeyChecking=no -r "$1" $EC2_USER@$EC2_HOST:"$2"
}

echo ""
echo "📦 Step 1: Setting up EC2 instance..."
ssh_cmd "
    # Update system
    sudo apt update && sudo apt upgrade -y
    
    # Install Node.js 20
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    
    # Install PM2 for process management
    sudo npm install -g pm2
    
    # Install nginx for reverse proxy
    sudo apt install -y nginx
    
    # Create app directory
    mkdir -p $APP_DIR
    
    echo '✅ EC2 setup complete'
"

echo ""
echo "📤 Step 2: Uploading application..."
scp_cmd "backend" "$APP_DIR/"
scp_cmd ".env" "$APP_DIR/"
scp_cmd "package.json" "$APP_DIR/" 2>/dev/null || true

echo ""
echo "📥 Step 3: Installing dependencies..."
ssh_cmd "
    cd $APP_DIR/backend/shared && npm install
    cd $APP_DIR/backend/tools/04-malwarehunter/api && npm install
    cd $APP_DIR/backend/tools/05-phishguard/api && npm install
    cd $APP_DIR/backend/tools/06-vulnscan/api && npm install
    cd $APP_DIR/backend/tools/07-pentestai/api && npm install
    cd $APP_DIR/backend/tools/08-securecode/api && npm install
    cd $APP_DIR/backend/tools/09-compliancecheck/api && npm install
    cd $APP_DIR/backend/tools/10-dataguardian/api && npm install
"

echo ""
echo "🔧 Step 4: Configuring Nginx..."
ssh_cmd "
    sudo tee /etc/nginx/sites-available/victorykit > /dev/null << 'NGINX'
server {
    listen 80;
    server_name api.fyzo.xyz;

    # MalwareHunter API
    location /api/v1/malwarehunter {
        proxy_pass http://localhost:4004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_cache_bypass \$http_upgrade;
    }

    # PhishGuard API
    location /api/v1/phishguard {
        proxy_pass http://localhost:4005;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # VulnScan API
    location /api/v1/vulnscan {
        proxy_pass http://localhost:4006;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # PenTestAI API
    location /api/v1/pentestai {
        proxy_pass http://localhost:4007;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # SecureCode API
    location /api/v1/securecode {
        proxy_pass http://localhost:4008;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # ComplianceCheck API
    location /api/v1/compliancecheck {
        proxy_pass http://localhost:4009;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # DataGuardian API
    location /api/v1/dataguardian {
        proxy_pass http://localhost:4010;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:4004/health;
    }
}
NGINX

    sudo ln -sf /etc/nginx/sites-available/victorykit /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t && sudo systemctl reload nginx
"

echo ""
echo "🚀 Step 5: Starting services with PM2..."
ssh_cmd "
    cd $APP_DIR
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << 'PM2'
module.exports = {
  apps: [
    {
      name: 'malwarehunter-api',
      script: 'backend/tools/04-malwarehunter/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'phishguard-api',
      script: 'backend/tools/05-phishguard/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'vulnscan-api',
      script: 'backend/tools/06-vulnscan/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'pentestai-api',
      script: 'backend/tools/07-pentestai/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'securecode-api',
      script: 'backend/tools/08-securecode/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'compliancecheck-api',
      script: 'backend/tools/09-compliancecheck/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'dataguardian-api',
      script: 'backend/tools/10-dataguardian/api/src/server.js',
      env: { NODE_ENV: 'production' }
    }
  ]
};
PM2

    pm2 delete all 2>/dev/null || true
    pm2 start ecosystem.config.js
    pm2 save
    sudo env PATH=\$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📍 Your APIs are live at:"
echo "   https://api.fyzo.xyz/api/v1/malwarehunter"
echo "   https://api.fyzo.xyz/api/v1/phishguard"
echo "   https://api.fyzo.xyz/api/v1/vulnscan"
echo "   https://api.fyzo.xyz/api/v1/pentestai"
echo "   https://api.fyzo.xyz/api/v1/securecode"
echo "   https://api.fyzo.xyz/api/v1/compliancecheck"
echo "   https://api.fyzo.xyz/api/v1/dataguardian"
echo ""
echo "🧪 Test: curl https://api.fyzo.xyz/health"
echo ""
