#!/bin/bash

# SSL Wildcard Certificate Renewal Script for VictoryKit
# This script renews the SSL certificate to include all subdomains

echo "🔐 VictoryKit SSL Wildcard Certificate Renewal"
echo "=============================================="
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

log_info "Checking current certificates..."
sudo certbot certificates

echo ""
log_warning "Current certificate only covers: fyzo.xyz, www.fyzo.xyz, api.fyzo.xyz"
log_info "We need to renew it as a wildcard certificate to cover all subdomains (*.fyzo.xyz)"

echo ""
read -p "Do you want to proceed with wildcard certificate renewal? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Certificate renewal cancelled."
    exit 0
fi

log_info "Backing up current certificate..."
sudo cp -r /etc/letsencrypt/live/fyzo.xyz /etc/letsencrypt/live/fyzo.xyz.backup.$(date +%Y%m%d_%H%M%S)

log_info "Starting wildcard certificate renewal..."
log_warning "You will need to add TXT records to Namecheap DNS when prompted"
echo ""

# Delete the old certificate first
sudo certbot delete --cert-name fyzo.xyz

# Request new wildcard certificate
sudo certbot certonly --manual --preferred-challenges dns -d '*.fyzo.xyz' -d fyzo.xyz

if [ $? -eq 0 ]; then
    log_success "New wildcard certificate generated successfully!"

    log_info "Verifying new certificate..."
    sudo certbot certificates

    log_info "Testing Nginx configuration..."
    sudo nginx -t

    if [ $? -eq 0 ]; then
        log_success "Nginx configuration is valid"
        log_info "Reloading Nginx..."
        sudo systemctl reload nginx
        log_success "SSL renewal complete! All subdomains now have valid certificates."
    else
        log_error "Nginx configuration error. Please check your configs."
        log_info "Restoring backup certificate..."
        sudo cp -r /etc/letsencrypt/live/fyzo.xyz.backup.* /etc/letsencrypt/live/fyzo.xyz
        sudo systemctl reload nginx
    fi
else
    log_error "Certificate renewal failed. Restoring backup..."
    sudo cp -r /etc/letsencrypt/live/fyzo.xyz.backup.* /etc/letsencrypt/live/fyzo.xyz
    sudo systemctl reload nginx
fi

echo ""
log_info "Next steps:"
echo "1. Test your subdomains: https://fguard.fyzo.xyz, https://phishguard.fyzo.xyz, etc."
echo "2. Remove the temporary TXT records from Namecheap DNS"
echo "3. Certificate will auto-renew in 90 days"

echo ""
log_info "To test the certificate:"
echo "openssl s_client -connect fguard.fyzo.xyz:443 -servername fguard.fyzo.xyz 2>/dev/null | openssl x509 -noout -text | grep DNS:"