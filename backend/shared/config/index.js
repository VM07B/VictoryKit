require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  
  // MongoDB
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    defaultDb: process.env.MONGODB_DB || 'victorykit',
    databases: {
      auth: 'victorykit_auth',
      fraudguard: 'victorykit_fraudguard',
      intelliscout: 'victorykit_intelliscout',
      threatradar: 'victorykit_threatradar',
      malwarehunter: 'victorykit_malwarehunter',
      phishguard: 'victorykit_phishguard',
      vulnscan: 'victorykit_vulnscan',
      pentestai: 'victorykit_pentestai',
      securecode: 'victorykit_securecode',
      compliancecheck: 'victorykit_compliancecheck',
      dataguardian: 'victorykit_dataguardian'
    }
  },
  
  // AWS
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'ap-southeast-1',
    s3Bucket: process.env.AWS_S3_BUCKET || 'victorykit'
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  
  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    toolPrice: parseInt(process.env.TOOL_PRICE_CENTS) || 100,
    accessHours: parseInt(process.env.TOOL_ACCESS_HOURS) || 24
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  },
  
  // Ports
  ports: {
    auth: parseInt(process.env.PORT_AUTH) || 5000,
    gateway: parseInt(process.env.PORT_GATEWAY) || 4000,
    fraudguard: 4001,
    intelliscout: 4002,
    threatradar: 4003,
    malwarehunter: parseInt(process.env.PORT_MALWAREHUNTER) || 4004,
    phishguard: parseInt(process.env.PORT_PHISHGUARD) || 4005,
    vulnscan: parseInt(process.env.PORT_VULNSCAN) || 4006,
    pentestai: 4007,
    securecode: 4008,
    compliancecheck: 4009,
    dataguardian: 4010
  },
  
  // ML Engines (local for now)
  ml: {
    malwarehunter: 'http://localhost:8004',
    phishguard: 'http://localhost:8005',
    vulnscan: 'http://localhost:8006'
  }
};

module.exports = config;
