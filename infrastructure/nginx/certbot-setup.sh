#!/bin/bash

# =============================================
# SSL Certificate Setup for MAULA.AI
# Using Let's Encrypt with Certbot
# =============================================

echo "🔒 Setting up SSL certificates for MAULA.AI"
echo ""

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Email for Let's Encrypt notifications
EMAIL="admin@maula.ai"

echo "📧 Using email: $EMAIL"
echo ""

# Generate certificates for main domains
DOMAINS=(
    "maula.ai"
    "www.maula.ai"
    "auth.maula.ai"
    "api.maula.ai"
)

for DOMAIN in "${DOMAINS[@]}"; do
    echo "🔒 Generating certificate for $DOMAIN..."
    
    sudo certbot certonly \
        --nginx \
        --non-interactive \
        --agree-tos \
        --email $EMAIL \
        -d $DOMAIN
    
    if [ $? -eq 0 ]; then
        echo "✅ Certificate for $DOMAIN generated successfully"
    else
        echo "❌ Failed to generate certificate for $DOMAIN"
    fi
    
    echo ""
done

# Set up auto-renewal
echo "⚙️ Setting up auto-renewal..."
sudo certbot renew --dry-run

if [ $? -eq 0 ]; then
    echo "✅ Auto-renewal configured successfully"
else
    echo "❌ Auto-renewal configuration failed"
fi

# Add cron job for auto-renewal
echo "📅 Adding cron job for certificate renewal..."
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && systemctl reload nginx") | crontab -

echo ""
echo "✅ SSL certificate setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Enable Nginx sites:"
echo "   sudo ln -s /etc/nginx/sites-available/maula.ai.conf /etc/nginx/sites-enabled/"
echo "   sudo ln -s /etc/nginx/sites-available/auth.maula.ai.conf /etc/nginx/sites-enabled/"
echo "   sudo ln -s /etc/nginx/sites-available/api.maula.ai.conf /etc/nginx/sites-enabled/"
echo ""
echo "2. Test Nginx configuration:"
echo "   sudo nginx -t"
echo ""
echo "3. Reload Nginx:"
echo "   sudo systemctl reload nginx"
echo ""
echo "📌 Certificates will auto-renew at 3 AM daily"
