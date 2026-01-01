# SSL Wildcard Certificate Setup for \*.maula.ai (Namecheap DNS)

## Prerequisites

- Domain maula.ai configured with Namecheap DNS
- SSH access to EC2 instance
- Certbot installed on EC2
- Access to Namecheap DNS management

## Steps:

1. Connect to your EC2 instance:

   ```bash
   ssh -i victorykit.pem ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com
   ```

2. Install Certbot if not installed:

   ```bash
   sudo apt update
   sudo apt install certbot
   ```

3. Request wildcard certificate using manual DNS validation:

   ```bash
   sudo certbot certonly --manual --preferred-challenges dns -d '*.maula.ai' -d maula.ai
   ```

4. Certbot will display TXT records that need to be added to your DNS. Example:

   ```
   Please deploy a DNS TXT record under the name:
   _acme-challenge.maula.ai

   With the value:
   xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

5. Log into your Namecheap account and go to Domain List → maula.ai → Advanced DNS

6. Add the TXT record:

   - **Type**: TXT
   - **Host**: \_acme-challenge
   - **Value**: [the value provided by certbot]
   - **TTL**: 300 (or default)

7. Wait for DNS propagation (can take 5-15 minutes)

8. Press Enter in the certbot terminal to continue the validation

9. If successful, certbot will generate the certificate

10. Verify certificate:
    ```bash
    sudo certbot certificates
    ```

## Important Notes

- **DNS Propagation**: TXT records can take time to propagate globally
- **Multiple Records**: For wildcard certificates, you may need to add multiple TXT records
- **TTL**: Use a low TTL (300) for faster propagation during setup
- **Cleanup**: Remove the TXT records after certificate generation (certbot will remind you)

## Nginx Configuration

Your Nginx config already references:
/etc/letsencrypt/live/maula.ai/fullchain.pem
/etc/letsencrypt/live/maula.ai/privkey.pem

The wildcard certificate will be stored in the same location and will cover:

- maula.ai
- \*.maula.ai (all subdomains)

## Certificate Renewal

Let's Encrypt certificates expire in 90 days. Certbot will automatically renew them, but you'll need to re-add TXT records for renewal. You can set up automated renewal with:

```bash
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Troubleshooting

- **DNS not propagated**: Wait longer and check with `dig TXT _acme-challenge.maula.ai`
- **Certificate not generated**: Check that TXT records are correct and propagated
- **Permission issues**: Make sure you're running certbot with sudo
