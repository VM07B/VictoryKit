#!/bin/bash

# SSL Wildcard Certificate Setup Script for Namecheap DNS
# This script helps with the manual DNS validation process

echo "🔐 MAULA.AI SSL Wildcard Certificate Setup (Namecheap)"
echo "======================================================"
echo ""

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
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on EC2
if [ -z "$SSH_CLIENT" ] && [ -z "$SSH_TTY" ]; then
    log_warning "This script should be run on your EC2 instance"
    log_info "Connect to EC2 first:"
    echo "ssh -i victorykit.pem ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com"
    exit 1
fi

log_info "Installing certbot..."
sudo apt update
sudo apt install -y certbot

log_info "Starting wildcard certificate request..."
log_warning "You will need to add TXT records to Namecheap DNS when prompted"
echo ""

# Run certbot with manual DNS challenge
sudo certbot certonly --manual --preferred-challenges dns -d '*.fyzo.xyz' -d fyzo.xyz

if [ $? -eq 0 ]; then
    log_success "Certificate generated successfully!"
    log_info "Verifying certificate..."
    sudo certbot certificates
    
    log_info "Testing Nginx configuration..."
    sudo nginx -t
    
    if [ $? -eq 0 ]; then
        log_success "Nginx configuration is valid"
        log_info "Reloading Nginx..."
        sudo systemctl reload nginx
        log_success "SSL setup complete! All subdomains now have valid certificates."
    else
        log_error "Nginx configuration error. Please check your configs."
    fi
else
    log_error "Certificate generation failed. Please check the DNS records and try again."
fi

echo ""
log_info "Next steps:"
echo "1. Test your subdomains: https://fguard.fyzo.xyz"
echo "2. Remove the temporary TXT records from Namecheap DNS"
echo "3. Certificate will auto-renew in 90 days"

