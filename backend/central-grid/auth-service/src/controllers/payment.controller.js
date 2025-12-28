const ToolAccess = require('../models/ToolAccess.model');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const logger = require('../utils/logger');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Tool pricing and details
const TOOL_PRICE = 1.00; // $1 USD
const ACCESS_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const TOOLS = {
  fraudguard: 'FraudGuard - AI Fraud Detection',
  intelliscout: 'IntelliScout - OSINT Intelligence',
  threatradar: 'ThreatRadar - Threat Detection',
  malwarehunter: 'MalwareHunter - Malware Analysis',
  phishguard: 'PhishGuard - Phishing Detection',
  vulnscan: 'VulnScan - Vulnerability Scanning',
  pentestai: 'PenTestAI - Penetration Testing',
  securecode: 'SecureCode - Code Security',
  compliancecheck: 'ComplianceCheck - Compliance Auditing',
  dataguardian: 'DataGuardian - Data Protection',
  cryptoshield: 'CryptoShield - Cryptography',
  iamcontrol: 'IAMControl - IAM Management',
  logintel: 'LogIntel - Log Analysis',
  netdefender: 'NetDefender - Network Defense',
  endpointshield: 'EndpointShield - Endpoint Protection',
  cloudsecure: 'CloudSecure - Cloud Security',
  apiguardian: 'APIGuardian - API Security',
  containerwatch: 'ContainerWatch - Container Security',
  devsecops: 'DevSecOps - DevSecOps Pipeline',
  incidentcommand: 'IncidentCommand - Incident Response',
  forensicslab: 'ForensicsLab - Digital Forensics',
  threathunt: 'ThreatHunt - Threat Hunting',
  ransomdefend: 'RansomDefend - Ransomware Defense',
  zerotrustnet: 'ZeroTrustNet - Zero Trust',
  privacyshield: 'PrivacyShield - Privacy Protection',
  socautomation: 'SOCAutomation - SOC Automation',
  threatintelhub: 'ThreatIntelHub - Threat Intelligence',
  assetdiscovery: 'AssetDiscovery - Asset Discovery',
  patchmanager: 'PatchManager - Patch Management',
  backupguardian: 'BackupGuardian - Backup Security',
  disasterrecovery: 'DisasterRecovery - Disaster Recovery',
  emailsecure: 'EmailSecure - Email Security',
  webappfirewall: 'WebAppFirewall - WAF Protection',
  botdefense: 'BotDefense - Bot Detection',
  ddosmitigator: 'DDoSMitigator - DDoS Mitigation',
  securegateway: 'SecureGateway - Web Gateway',
  mobilesecurity: 'MobileSecurity - Mobile Security',
  iotsecure: 'IoTSecure - IoT Security',
  supplychainsec: 'SupplyChainSec - Supply Chain Security',
  brandprotect: 'BrandProtect - Brand Protection',
  datalossprevention: 'DataLossPrevention - DLP',
  userbehavioranalytics: 'UserBehaviorAnalytics - UBA',
  threatmodeling: 'ThreatModeling - Threat Modeling',
  redteamsim: 'RedTeamSim - Red Team Simulation',
  blueteamops: 'BlueTeamOps - Blue Team Operations',
  purpleteamhub: 'PurpleTeamHub - Purple Team Collaboration',
  cyberinsurance: 'CyberInsurance - Cyber Insurance',
  securityawareness: 'SecurityAwareness - Security Training',
  vendorriskmgmt: 'VendorRiskMgmt - Vendor Risk Management',
  cyberthreatmap: 'CyberThreatMap - Threat Visualization'
};

class PaymentController {
  // Purchase tool access
  async purchaseToolAccess(req, res, next) {
    try {
      const { toolId } = req.body;

      // Validate tool exists
      if (!TOOLS[toolId]) {
        throw ApiError.badRequest('Invalid tool ID');
      }

      // Check if user already has active access
      const existingAccess = await ToolAccess.getActiveAccess(req.user.id, toolId);
      if (existingAccess) {
        throw ApiError.conflict(
          `You already have active access to ${TOOLS[toolId]} until ${existingAccess.expiresAt.toISOString()}`
        );
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: TOOL_PRICE * 100, // Convert to cents
        currency: 'usd',
        metadata: {
          userId: req.user.id,
          toolId,
          toolName: TOOLS[toolId]
        }
      });

      logger.info(`Payment intent created for ${req.user.email}: ${toolId}`);

      res.json(ApiResponse.success({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: TOOL_PRICE,
        toolId,
        toolName: TOOLS[toolId],
        duration: '24 hours'
      }, 'Payment initiated'));
    } catch (error) {
      next(error);
    }
  }

  // Confirm payment and grant access
  async confirmPayment(req, res, next) {
    try {
      const { paymentIntentId } = req.body;

      // Retrieve payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        throw ApiError.badRequest('Payment not completed');
      }

      const { userId, toolId, toolName } = paymentIntent.metadata;

      // Verify user
      if (userId !== req.user.id) {
        throw ApiError.forbidden('Payment does not belong to this user');
      }

      // Check for existing access record with this payment
      const existing = await ToolAccess.findOne({ paymentId: paymentIntentId });
      if (existing) {
        return res.json(ApiResponse.success(existing, 'Access already granted'));
      }

      // Create access record
      const purchasedAt = new Date();
      const expiresAt = new Date(purchasedAt.getTime() + ACCESS_DURATION);

      const toolAccess = new ToolAccess({
        userId,
        toolId,
        toolName,
        paymentAmount: TOOL_PRICE,
        paymentCurrency: 'USD',
        paymentId: paymentIntentId,
        paymentProvider: 'stripe',
        paymentStatus: 'completed',
        purchasedAt,
        expiresAt,
        isActive: true,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      await toolAccess.save();

      logger.info(`Access granted: ${req.user.email} -> ${toolId} (24h)`);

      res.status(201).json(ApiResponse.created({
        ...toolAccess.toObject(),
        remainingTime: ACCESS_DURATION
      }, 'Access granted successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Get user's active tool access
  async getMyAccess(req, res, next) {
    try {
      const { page = 1, limit = 50, toolId, activeOnly = 'true' } = req.query;

      const query = { userId: req.user.id };
      
      if (toolId) query.toolId = toolId;
      if (activeOnly === 'true') {
        query.isActive = true;
        query.expiresAt = { $gt: new Date() };
      }

      const accessRecords = await ToolAccess.find(query)
        .sort({ purchasedAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean();

      const total = await ToolAccess.countDocuments(query);

      // Add remaining time to each record
      const enrichedRecords = accessRecords.map(record => ({
        ...record,
        remainingTime: Math.max(0, new Date(record.expiresAt).getTime() - Date.now()),
        isExpired: new Date(record.expiresAt) < new Date()
      }));

      res.json(ApiResponse.success({
        access: enrichedRecords,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }));
    } catch (error) {
      next(error);
    }
  }

  // Check access to specific tool
  async checkAccess(req, res, next) {
    try {
      const { toolId } = req.params;

      if (!TOOLS[toolId]) {
        throw ApiError.badRequest('Invalid tool ID');
      }

      const access = await ToolAccess.getActiveAccess(req.user.id, toolId);

      if (!access) {
        return res.json(ApiResponse.success({
          hasAccess: false,
          toolId,
          toolName: TOOLS[toolId],
          price: TOOL_PRICE,
          duration: '24 hours'
        }, 'No active access'));
      }

      res.json(ApiResponse.success({
        hasAccess: true,
        access: {
          ...access.toObject(),
          remainingTime: Math.max(0, access.expiresAt.getTime() - Date.now())
        }
      }, 'Active access found'));
    } catch (error) {
      next(error);
    }
  }

  // Get all available tools
  async getAvailableTools(req, res, next) {
    try {
      const userId = req.user.id;

      // Get all active access for user
      const userAccess = await ToolAccess.find({
        userId,
        isActive: true,
        expiresAt: { $gt: new Date() }
      }).lean();

      const accessMap = {};
      userAccess.forEach(access => {
        accessMap[access.toolId] = {
          expiresAt: access.expiresAt,
          remainingTime: Math.max(0, new Date(access.expiresAt).getTime() - Date.now())
        };
      });

      // Build tools list with access status
      const tools = Object.keys(TOOLS).map(toolId => ({
        id: toolId,
        name: TOOLS[toolId],
        price: TOOL_PRICE,
        currency: 'USD',
        duration: '24 hours',
        hasAccess: !!accessMap[toolId],
        access: accessMap[toolId] || null
      }));

      res.json(ApiResponse.success({
        tools,
        totalTools: tools.length,
        accessibleTools: Object.keys(accessMap).length
      }));
    } catch (error) {
      next(error);
    }
  }

  // Get payment history
  async getPaymentHistory(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;

      const payments = await ToolAccess.find({ userId: req.user.id })
        .sort({ purchasedAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .select('toolId toolName paymentAmount paymentCurrency purchasedAt expiresAt paymentStatus')
        .lean();

      const total = await ToolAccess.countDocuments({ userId: req.user.id });

      const totalSpent = await ToolAccess.aggregate([
        { $match: { userId: req.user.id, paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$paymentAmount' } } }
      ]);

      res.json(ApiResponse.success({
        payments,
        summary: {
          totalPayments: total,
          totalSpent: totalSpent[0]?.total || 0,
          currency: 'USD'
        },
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
