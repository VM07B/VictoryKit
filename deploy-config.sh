# MAULA.AI Production Deployment Configuration - EXAMPLE
# Copy this to deploy-config.sh and edit with your actual values

# AWS EC2 Configuration
EC2_HOST="ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com"  # Your actual EC2 public IP
EC2_KEY="/workspaces/VictoryKit/victorykit.pem"  # Your SSH private key path

# Git Configuration
REPO_URL="https://github.com/VM07B/VictoryKit.git"
BRANCH="main"

# Tools Configuration
# Format: tool_name subdomain port api_port ml_port ai_port
TOOLS_CONFIG=(
    "01-fraudguard fguard 3001 4001 8001 6001"
    "02-intelliscout iscout 3002 4002 8002 6002"
    "03-threatradar tradar 3003 4003 8003 6003"
    "04-malwarehunter mwhunt 3004 4004 8004 6004"
    "05-phishguard pguard 3005 4005 8005 6005"
    "06-vulnscan vscan 3006 4006 8006 6006"
    "07-pentestai pentest 3007 4007 8007 6007"
    "08-securecode scode 3008 4008 8008 6008"
    "09-compliancecheck compchk 3009 4009 8009 6009"
    "10-dataguardian dguard 3010 4010 8010 6010"
    "11-incidentresponse inciresp 3011 4011 8011 6011"
    "12-networkguard netguard 3012 4012 8012 6012"
    "13-cloudarmor cloudarm 3013 4013 8013 6013"
    "14-identityshield idshield 3014 4014 8014 6014"
    "15-cryptovault cryptov 3015 4015 8015 6015"
    "16-accesscontrol accctrl 3016 4016 8016 6016"
    "17-audittrail audtrail 3017 4017 8017 6017"
    "18-threatmodel thrmodel 3018 4018 8018 6018"
    "19-riskassess riskass 3019 4019 8019 6019"
    "20-securityscore secscore 3020 4020 8020 6020"
    "21-wafmanager wafmgr 3021 4021 8021 6021"
    "22-apiguard apiguard 3022 4022 8022 6022"
    "23-botdefender botdef 3023 4023 8023 6023"
    "24-ddosshield ddosshld 3024 4024 8024 6024"
    "25-sslmonitor sslmon 3025 4025 8025 6025"
    "26-blueteamai blueteam 3026 4026 8026 6026"
    "27-siemcommander siemcmd 3027 4027 8027 6027"
    "28-soarengine soareng 3028 4028 8028 6028"
    "29-riskscoreai riskai 3029 4029 8029 6029"
    "30-policyengine poleng 3030 4030 8030 6030"
    "31-audittracker audtrack 3031 4031 8031 6031"
    "32-zerotrustai zerotrust 3032 4032 8032 6032"
    "33-passwordvault passvault 3033 4033 8033 6033"
    "34-biometricai biomai 3034 4034 8034 6034"
    "35-emailguard emailgd 3035 4035 8035 6035"
    "36-webfilter webfilt 3036 4036 8036 6036"
    "37-dnsshield dnsshld 3037 4037 8037 6037"
    "38-firewallai firewai 3038 4038 8038 6038"
    "39-vpnguardian vpnguard 3039 4039 8039 6039"
    "40-wirelesswatch wirewatch 3040 4040 8040 6040"
    "41-iotsecure iotsec 3041 4041 8041 6041"
    "42-mobiledefend mobdef 3042 4042 8042 6042"
    "43-backupguard backupgd 3043 4043 8043 6043"
    "44-drplan drplan 3044 4044 8044 6044"
    "45-privacyshield privshld 3045 4045 8045 6045"
    "46-gdprcompliance gdprcomp 3046 4046 8046 6046"
    "47-hipaaguard hipaagd 3047 4047 8047 6047"
    "48-pcidsscheck pcidss 3048 4048 8048 6048"
    "49-bugbountyai bugbount 3049 4049 8049 6049"
    "50-cybereduai cyberedu 3050 4050 8050 6050"
)

# SSL Certificate Path (Let's Encrypt)
SSL_CERT_PATH="/etc/letsencrypt/live/fyzo.xyz"

# MongoDB Configuration
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/maula_ai"

# Environment Variables for Production
NODE_ENV="production"
PORT="3000"  # Main dashboard port