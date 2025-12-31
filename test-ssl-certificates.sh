#!/bin/bash

# Test SSL Certificate for VictoryKit Subdomains

echo "🔍 Testing SSL Certificates for VictoryKit Subdomains"
echo "===================================================="
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

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# List of subdomains to test
subdomains=(
    "fguard"
    "phishguard"
    "vulnscan"
    "malwarehunter"
    "pentestai"
    "securecode"
    "compliancecheck"
    "dataguardian"
)

log_info "Testing certificate for fyzo.xyz..."
if curl -s --connect-timeout 5 https://fyzo.xyz > /dev/null 2>&1; then
    log_success "fyzo.xyz - OK"
else
    log_error "fyzo.xyz - FAILED"
fi

for subdomain in "${subdomains[@]}"; do
    domain="${subdomain}.fyzo.xyz"
    log_info "Testing certificate for $domain..."
    if curl -s --connect-timeout 5 "https://$domain" > /dev/null 2>&1; then
        log_success "$domain - OK"
    else
        log_error "$domain - FAILED"
    fi
done

echo ""
log_info "Detailed certificate check for fguard.fyzo.xyz:"
echo "openssl s_client -connect fguard.fyzo.xyz:443 -servername fguard.fyzo.xyz 2>/dev/null | openssl x509 -noout -text | grep 'DNS:' | tr ',' '\n' | sed 's/DNS://g' | sed 's/^[[:space:]]*//'"
echo ""
openssl s_client -connect fguard.fyzo.xyz:443 -servername fguard.fyzo.xyz 2>/dev/null | openssl x509 -noout -text | grep "DNS:" | tr ',' '\n' | sed 's/DNS://g' | sed 's/^[[:space:]]*//' | while read domain; do
    echo -e "${GREEN}✓${NC} $domain"
done