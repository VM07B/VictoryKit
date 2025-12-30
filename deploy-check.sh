#!/bin/bash

# MAULA.AI Deployment Pre-flight Check
# Validates configuration and connectivity before deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Load configuration
if [ -f "deploy-config.sh" ]; then
    source deploy-config.sh
    log_success "Configuration loaded from deploy-config.sh"
else
    log_error "deploy-config.sh not found. Run: cp deploy-config.sh.example deploy-config.sh"
    exit 1
fi

# Check prerequisites
log_info "Checking local prerequisites..."

command -v git >/dev/null 2>&1 && log_success "Git installed" || log_error "Git not installed"
command -v scp >/dev/null 2>&1 && log_success "SCP available" || log_error "SCP not available"
command -v ssh >/dev/null 2>&1 && log_success "SSH available" || log_error "SSH not available"
command -v node >/dev/null 2>&1 && log_success "Node.js installed" || log_error "Node.js not installed"
command -v npm >/dev/null 2>&1 && log_success "NPM installed" || log_error "NPM not installed"

# Check SSH key
if [ -f "${EC2_KEY/#\~/$HOME}" ]; then
    log_success "SSH key exists: $EC2_KEY"
else
    log_error "SSH key not found: $EC2_KEY"
fi

# Test SSH connection
log_info "Testing SSH connection to EC2..."
if ssh -i "${EC2_KEY/#\~/$HOME}" -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$EC2_HOST" "echo 'SSH connection successful'" 2>/dev/null; then
    log_success "SSH connection to EC2 successful"
else
    log_error "Cannot connect to EC2 via SSH. Check IP, key, and security groups."
fi

# Check EC2 prerequisites
log_info "Checking EC2 server prerequisites..."
check_ec2_cmd() {
    ssh -i "${EC2_KEY/#\~/$HOME}" -o StrictHostKeyChecking=no "$EC2_HOST" "$1" 2>/dev/null
}

check_ec2_cmd "command -v node" && log_success "Node.js installed on EC2" || log_error "Node.js not installed on EC2"
check_ec2_cmd "command -v python3" && log_success "Python3 installed on EC2" || log_error "Python3 not installed on EC2"
check_ec2_cmd "command -v nginx" && log_success "Nginx installed on EC2" || log_error "Nginx not installed on EC2"
check_ec2_cmd "command -v serve" && log_success "Serve installed on EC2" || log_error "Serve not installed on EC2 (run: sudo npm install -g serve)"

# Check SSL certificates
if check_ec2_cmd "[ -f $SSL_CERT_PATH/fullchain.pem ]"; then
    log_success "SSL certificates exist"
else
    log_warning "SSL certificates not found. Run: sudo certbot --nginx -d fyzo.xyz"
fi

# Check tools configuration
log_info "Validating tools configuration..."
for tool_config in "${TOOLS_CONFIG[@]}"; do
    read -r tool subdomain port api_port ml_port ai_port <<< "$tool_config"

    if [ -d "frontend/tools/$tool" ]; then
        log_success "Frontend exists: $tool"
    else
        log_error "Frontend missing: frontend/tools/$tool"
    fi

    if [ -d "backend/tools/$tool/api" ]; then
        log_success "API exists: $tool"
    else
        log_warning "API missing: backend/tools/$tool/api"
    fi

    if [ -d "backend/tools/$tool/ml-engine" ]; then
        log_success "ML Engine exists: $tool"
    else
        log_warning "ML Engine missing: backend/tools/$tool/ml-engine"
    fi

    if [ -d "backend/tools/$tool/ai-assistant" ]; then
        log_success "AI Assistant exists: $tool"
    else
        log_warning "AI Assistant missing: backend/tools/$tool/ai-assistant"
    fi
done

# Check Git status
log_info "Checking Git status..."
if [ -n "$(git status --porcelain)" ]; then
    log_warning "Uncommitted changes detected. They will be committed during deployment."
else
    log_success "Git working directory is clean"
fi

# Summary
log_info "Pre-flight check completed!"
echo
echo "📋 Summary:"
echo "  - EC2 Host: $EC2_HOST"
echo "  - Tools to deploy: ${#TOOLS_CONFIG[@]}"
echo "  - Main domain: fyzo.xyz"
echo
echo "🚀 Ready to deploy? Run: ./deploy-production.sh"
echo
echo "💡 First time? Check DEPLOYMENT-README.md for detailed setup instructions"