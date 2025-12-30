#!/bin/bash

# MAULA.AI Production Deployment Script
# Automates git commit/push and deployment to AWS EC2

set -e  # Exit on any error

# Load configuration
if [ -f "deploy-config.sh" ]; then
    source deploy-config.sh
else
    echo "Error: deploy-config.sh not found. Please create it with your deployment settings."
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get current timestamp
get_timestamp() {
    date +"%Y%m%d_%H%M%S"
}

# Function to build frontend
build_frontend() {
    local tool=$1
    log_info "Building $tool frontend..."

    if [ ! -d "frontend/tools/$tool" ]; then
        log_error "Tool directory frontend/tools/$tool not found"
        exit 1
    fi

    cd "frontend/tools/$tool"
    npm install
    npm run build

    if [ $? -eq 0 ]; then
        log_success "$tool frontend built successfully"
    else
        log_error "Failed to build $tool frontend"
        exit 1
    fi

    cd ../../..
}

# Function to deploy tool to EC2
deploy_tool() {
    local tool=$1
    local subdomain=$2
    local port=$3

    log_info "Deploying $tool to $subdomain (port $port)..."

    # Create remote directory
    ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo mkdir -p /var/www/$subdomain"

    # Copy built files
    scp -i "$EC2_KEY" -o StrictHostKeyChecking=no -r "frontend/tools/$tool/dist/*" "$EC2_HOST:/tmp/$tool-dist/"

    # Move files to final location
    ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo mv /tmp/$tool-dist/* /var/www/$subdomain/ && sudo chown -R ubuntu:ubuntu /var/www/$subdomain"

    # Create/update systemd service
    ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo tee /etc/systemd/system/$tool-frontend.service > /dev/null <<EOF
[Unit]
Description=$tool Frontend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/var/www/$subdomain
ExecStart=/usr/bin/serve -s . -l $port
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF"

    # Enable and restart service
    ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo systemctl enable $tool-frontend && sudo systemctl restart $tool-frontend"

    log_success "$tool deployed to $subdomain"
}

# Function to update Nginx configuration
update_nginx() {
    local tool=$1
    local subdomain=$2
    local port=$3
    local api_port=$4
    local ws_port=$5

    log_info "Updating Nginx configuration for $subdomain..."

    ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo tee /etc/nginx/sites-available/$subdomain > /dev/null <<EOF
server {
    listen 443 ssl http2;
    server_name $subdomain.fyzo.xyz;

    ssl_certificate /etc/letsencrypt/live/fyzo.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fyzo.xyz/privkey.pem;

    # Security headers
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;

    # Proxy to $tool frontend (port $port)
    location / {
        proxy_pass http://localhost:$port;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_cache_bypass \\\$http_upgrade;
    }

    # Proxy API requests to $tool backend
    location /api {
        proxy_pass http://localhost:$api_port;
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
    }

    # Proxy WebSocket for AI chat
    location /ws {
        proxy_pass http://localhost:$ws_port;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host \\\$host;
        proxy_read_timeout 86400;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name $subdomain.fyzo.xyz;
    return 301 https://\\\$server_name\\\$request_uri;
}
EOF"

    # Enable site if not already enabled
    ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo ln -sf /etc/nginx/sites-available/$subdomain /etc/nginx/sites-enabled/ 2>/dev/null || true"

    # Test and reload Nginx
    ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo nginx -t && sudo systemctl reload nginx"

    log_success "Nginx updated for $subdomain"
}

# Function to deploy backend services
deploy_backend() {
    local tool=$1
    local api_port=$2
    local ml_port=$3
    local ai_port=$4

    log_info "Deploying $tool backend services..."

    # Deploy API
    if [ -d "backend/tools/$tool/api" ]; then
        cd "backend/tools/$tool/api"
        npm install
        npm run build
        cd ../../..

        ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo mkdir -p /var/www/$tool-api"
        scp -i "$EC2_KEY" -o StrictHostKeyChecking=no -r "backend/tools/$tool/api/dist/*" "$EC2_HOST:/tmp/$tool-api/"
        ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo mv /tmp/$tool-api/* /var/www/$tool-api/ && sudo chown -R ubuntu:ubuntu /var/www/$tool-api"

        ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo tee /etc/systemd/system/$tool-api.service > /dev/null <<EOF
[Unit]
Description=$tool API
After=network.target mongodb.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/var/www/$tool-api
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF"

        ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo systemctl enable $tool-api && sudo systemctl restart $tool-api"
        log_success "$tool API deployed on port $api_port"
    fi

    # Deploy ML Engine
    if [ -d "backend/tools/$tool/ml-engine" ]; then
        ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo mkdir -p /var/www/$tool-ml"
        scp -i "$EC2_KEY" -o StrictHostKeyChecking=no -r "backend/tools/$tool/ml-engine/*" "$EC2_HOST:/tmp/$tool-ml/"
        ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo mv /tmp/$tool-ml/* /var/www/$tool-ml/ && sudo chown -R ubuntu:ubuntu /var/www/$tool-ml"

        ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "cd /var/www/$tool-ml && pip3 install -r requirements.txt"

        ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo tee /etc/systemd/system/$tool-ml.service > /dev/null <<EOF
[Unit]
Description=$tool ML Engine
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/var/www/$tool-ml
ExecStart=/usr/bin/python3 main.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF"

        ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo systemctl enable $tool-ml && sudo systemctl restart $tool-ml"
        log_success "$tool ML Engine deployed on port $ml_port"
    fi

    # Deploy AI Assistant
    if [ -d "backend/tools/$tool/ai-assistant" ]; then
        cd "backend/tools/$tool/ai-assistant"
        npm install
        npm run build
        cd ../../..

        ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo mkdir -p /var/www/$tool-ai"
        scp -i "$EC2_KEY" -o StrictHostKeyChecking=no -r "backend/tools/$tool/ai-assistant/dist/*" "$EC2_HOST:/tmp/$tool-ai/"
        ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo mv /tmp/$tool-ai/* /var/www/$tool-ai/ && sudo chown -R ubuntu:ubuntu /var/www/$tool-ai"

        ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo tee /etc/systemd/system/$tool-ai.service > /dev/null <<EOF
[Unit]
Description=$tool AI Assistant
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/var/www/$tool-ai
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF"

        ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo systemctl enable $tool-ai && sudo systemctl restart $tool-ai"
        log_success "$tool AI Assistant deployed on port $ai_port"
    fi
}

# Function to test deployment
test_deployment() {
    local subdomain=$1

    log_info "Testing deployment for $subdomain.fyzo.xyz..."

    # Test HTTPS
    if curl -s -o /dev/null -w "%{http_code}" "https://$subdomain.fyzo.xyz" | grep -q "200"; then
        log_success "HTTPS endpoint responding"
    else
        log_warning "HTTPS endpoint not responding"
    fi

    # Test API health
    if curl -s "https://$subdomain.fyzo.xyz/api/health" > /dev/null; then
        log_success "API health endpoint responding"
    else
        log_warning "API health endpoint not responding"
    fi
}

# Main deployment function
main() {
    log_info "Starting MAULA.AI production deployment..."

    # Check prerequisites
    if ! command_exists git; then
        log_error "Git is not installed"
        exit 1
    fi

    if ! command_exists scp; then
        log_error "SCP is not available"
        exit 1
    fi

    if ! command_exists ssh; then
        log_error "SSH is not available"
        exit 1
    fi

    # Git operations
    log_info "Committing and pushing changes..."
    git add .
    git commit -m "Deploy $(get_timestamp)" || log_warning "No changes to commit"
    git push origin $BRANCH

    # Deploy main dashboard
    log_info "Deploying main dashboard..."
    if [ -d "frontend/main-dashboard" ]; then
        cd frontend/main-dashboard
        npm install
        npm run build
        cd ../..

        ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo mkdir -p /var/www/fyzo.xyz"
        scp -i "$EC2_KEY" -o StrictHostKeyChecking=no -r "frontend/main-dashboard/dist/*" "$EC2_HOST:/tmp/dashboard-dist/"
        ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo mv /tmp/dashboard-dist/* /var/www/fyzo.xyz/ && sudo chown -R ubuntu:ubuntu /var/www/fyzo.xyz"

        ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo tee /etc/systemd/system/dashboard.service > /dev/null <<EOF
[Unit]
Description=MAULA.AI Dashboard
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/var/www/fyzo.xyz
ExecStart=/usr/bin/serve -s . -l 3000
Restart=always

[Install]
WantedBy=multi-user.target
EOF"

        ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo systemctl enable dashboard && sudo systemctl restart dashboard"
        log_success "Main dashboard deployed"
    fi

    # Deploy tools
    for tool_config in "${TOOLS_CONFIG[@]}"; do
        read -r tool subdomain port api_port ml_port ai_port <<< "$tool_config"

        log_info "Deploying $tool..."

        # Build frontend
        build_frontend "$tool"

        # Deploy frontend
        deploy_tool "$tool" "$subdomain.fyzo.xyz" "$port"

        # Update Nginx
        update_nginx "$tool" "$subdomain" "$port" "$api_port" "$ai_port"

        # Deploy backend
        deploy_backend "$tool" "$api_port" "$ml_port" "$ai_port"

        # Test deployment
        test_deployment "$subdomain"

        log_success "$tool deployment completed"
    done

    log_success "🎉 MAULA.AI deployment completed successfully!"
    log_info "Access your platform at: https://fyzo.xyz"
}

# Run main function
main "$@"