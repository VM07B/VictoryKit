#!/bin/bash

# Fix Dashboard Deployment Script
# Run this script to fix the 502 error on maula.ai

set -e

EC2_HOST="ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com"
EC2_KEY="/workspaces/VictoryKit/victorykit.pem"

echo "🔧 Fixing dashboard deployment on maula.ai..."

# Ensure the SSH key has correct permissions
chmod 600 "$EC2_KEY" 2>/dev/null || true

echo "📦 Step 1: Creating directories and cloning/updating repo..."
ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "
    set -e
    
    # Create directories
    sudo mkdir -p /var/www/maula.ai/repo
    sudo mkdir -p /var/www/maula.ai/live
    sudo chown -R ubuntu:ubuntu /var/www/maula.ai
    
    # Clone or update the repo
    if [ -d '/var/www/maula.ai/repo/.git' ]; then
        echo 'Updating existing repo...'
        cd /var/www/maula.ai/repo
        git fetch origin
        git reset --hard origin/main
    else
        echo 'Cloning fresh repo...'
        rm -rf /var/www/maula.ai/repo
        git clone https://github.com/VM07B/VictoryKit.git /var/www/maula.ai/repo
    fi
"

echo "🏗️ Step 2: Building the dashboard..."
ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "
    set -e
    
    # Load NVM if available
    export NVM_DIR=\"/home/ubuntu/.nvm\"
    [ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo 'Installing Node.js...'
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    echo 'Node version:' \$(node --version)
    echo 'npm version:' \$(npm --version)
    
    # Build the dashboard
    cd /var/www/maula.ai/repo/frontend/main-dashboard
    npm install
    npm run build
    
    # Copy build output to live directory
    sudo rm -rf /var/www/maula.ai/live/*
    if [ -d 'out' ]; then
        sudo cp -r out/. /var/www/maula.ai/live/
        echo 'Copied Next.js static export (out/)'
    elif [ -d '.next/standalone' ]; then
        sudo cp -r .next/standalone/. /var/www/maula.ai/live/
        echo 'Copied Next.js standalone build'
    elif [ -d 'dist' ]; then
        sudo cp -r dist/. /var/www/maula.ai/live/
        echo 'Copied dist build'
    else
        echo 'Warning: No build output found!'
        ls -la
    fi
    
    # List what we have
    ls -la /var/www/maula.ai/live/
"

echo "🔧 Step 3: Installing serve and updating systemd service..."
ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "
    set -e
    
    # Install serve globally if not present
    if ! command -v serve &> /dev/null; then
        sudo npm install -g serve
    fi
    
    # Create/update the dashboard systemd service
    sudo tee /etc/systemd/system/dashboard.service > /dev/null <<EOF
[Unit]
Description=MAULA.AI Dashboard
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/var/www/maula.ai/live
ExecStart=/usr/bin/serve -s . -l 3000
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

    # Reload and restart the service
    sudo systemctl daemon-reload
    sudo systemctl enable dashboard
    sudo systemctl restart dashboard
    
    # Wait a moment and check status
    sleep 3
    sudo systemctl status dashboard --no-pager || true
"

echo "🌐 Step 4: Updating Nginx configuration for maula.ai..."
ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "
    set -e
    
    # Create Nginx config for maula.ai (Cloudflare handles SSL)
    sudo tee /etc/nginx/sites-available/maula.ai > /dev/null <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name maula.ai www.maula.ai *.maula.ai;
    
    # Trust Cloudflare IPs for real IP
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 131.0.72.0/22;
    real_ip_header CF-Connecting-IP;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

    # Remove any conflicting configs
    sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
    sudo rm -f /etc/nginx/sites-enabled/maula.ai 2>/dev/null || true
    
    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/maula.ai /etc/nginx/sites-enabled/
    
    # Test and reload Nginx
    sudo nginx -t && sudo systemctl reload nginx
"

echo "✅ Step 5: Verifying deployment..."
ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "
    echo 'Checking port 3000...'
    ss -tlnp | grep :3000 || echo 'Port 3000 not listening yet'
    
    echo ''
    echo 'Testing local connection...'
    curl -s http://localhost:3000 | head -5 || echo 'Dashboard not responding locally'
    
    echo ''
    echo 'Dashboard service status:'
    sudo systemctl status dashboard --no-pager | head -15
"

echo ""
echo "🎉 Deployment fix complete!"
echo "Please visit https://maula.ai to verify the site is working."
