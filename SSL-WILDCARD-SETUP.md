# SSL Wildcard Certificate Setup for *.fyzo.xyz

## Prerequisites
- Domain fyzo.xyz configured with DNS provider
- SSH access to EC2 instance
- Certbot installed on EC2

## Steps:

1. Connect to your EC2 instance:
   ssh -i victorykit.pem ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com

2. Install Certbot if not installed:
   sudo apt update
   sudo apt install certbot python3-certbot-dns-cloudflare

3. Create Cloudflare API token (if using Cloudflare DNS):
   - Go to Cloudflare Dashboard → My Profile → API Tokens
   - Create token with DNS:Edit permission for fyzo.xyz zone

4. Create credentials file:
   sudo nano /etc/letsencrypt/cloudflare.ini
   # Add:
   dns_cloudflare_api_token = YOUR_API_TOKEN_HERE

5. Set proper permissions:
   sudo chmod 600 /etc/letsencrypt/cloudflare.ini

6. Request wildcard certificate:
   sudo certbot certonly --dns-cloudflare --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini -d '*.fyzo.xyz' -d fyzo.xyz

7. Verify certificate:
   sudo certbot certificates

## Alternative: Manual DNS validation
If you prefer manual DNS validation:

1. Run certbot with manual plugin:
   sudo certbot certonly --manual --preferred-challenges dns -d '*.fyzo.xyz' -d fyzo.xyz

2. Add the TXT records to your DNS as instructed

3. Complete the validation

## Nginx Configuration
Your Nginx config already references:
/etc/letsencrypt/live/fyzo.xyz/fullchain.pem
/etc/letsencrypt/live/fyzo.xyz/privkey.pem

The wildcard certificate will be stored in the same location.
