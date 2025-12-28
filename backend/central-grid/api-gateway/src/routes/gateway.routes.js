const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { authMiddleware, optionalAuth } = require('../../../shared/middleware/auth.middleware');
const { checkToolAccessFromRoute } = require('../../../shared/middleware/toolAccess.middleware');
const { apiLimiter } = require('../../../shared/middleware/rateLimiter.middleware');
const logger = require('../../../shared/utils/logger');

const router = express.Router();

// Auth service proxy (public routes - includes /auth and /payment)
router.use(['/auth', '/payment'], createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:5000',
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/auth': '/api/v1/auth',
    '^/api/v1/payment': '/api/v1/payment'
  },
  onError: (err, req, res) => {
    logger.error(`Auth Service proxy error: ${err.message}`);
    res.status(503).json({
      success: false,
      message: 'Auth service unavailable',
      timestamp: new Date().toISOString()
    });
  }
}));

// Tool proxies (protected routes)
const createToolProxy = (toolName, port) => {
  return createProxyMiddleware({
    target: `http://localhost:${port}`,
    changeOrigin: true,
    pathRewrite: {
      [`^/api/v1/${toolName}`]: '/api/v1'
    },
    onProxyReq: (proxyReq, req) => {
      // Forward user info to tool services
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.id);
        proxyReq.setHeader('X-User-Email', req.user.email);
        proxyReq.setHeader('X-User-Role', req.user.role);
      }
    },
    onError: (err, req, res) => {
      logger.error(`${toolName} proxy error: ${err.message}`);
      res.status(503).json({
        success: false,
        message: `${toolName} service unavailable`,
        timestamp: new Date().toISOString()
      });
    }
  });
};

// All 50 tool routes
const tools = [
  { name: 'fraudguard', port: 4001 },
  { name: 'intelliscout', port: 4002 },
  { name: 'threatradar', port: 4003 },
  { name: 'malwarehunter', port: 4004 },
  { name: 'phishguard', port: 4005 },
  { name: 'vulnscan', port: 4006 },
  { name: 'pentestai', port: 4007 },
  { name: 'securecode', port: 4008 },
  { name: 'compliancecheck', port: 4009 },
  { name: 'dataguardian', port: 4010 },
  { name: 'cryptoshield', port: 4011 },
  { name: 'iamcontrol', port: 4012 },
  { name: 'logintel', port: 4013 },
  { name: 'netdefender', port: 4014 },
  { name: 'endpointshield', port: 4015 },
  { name: 'cloudsecure', port: 4016 },
  { name: 'apiguardian', port: 4017 },
  { name: 'containerwatch', port: 4018 },
  { name: 'devsecops', port: 4019 },
  { name: 'incidentcommand', port: 4020 },
  { name: 'forensicslab', port: 4021 },
  { name: 'threathunt', port: 4022 },
  { name: 'ransomdefend', port: 4023 },
  { name: 'zerotrustnet', port: 4024 },
  { name: 'privacyshield', port: 4025 },
  { name: 'socautomation', port: 4026 },
  { name: 'threatintelhub', port: 4027 },
  { name: 'assetdiscovery', port: 4028 },
  { name: 'patchmanager', port: 4029 },
  { name: 'backupguardian', port: 4030 },
  { name: 'disasterrecovery', port: 4031 },
  { name: 'emailsecure', port: 4032 },
  { name: 'webappfirewall', port: 4033 },
  { name: 'botdefense', port: 4034 },
  { name: 'ddosmitigator', port: 4035 },
  { name: 'securegateway', port: 4036 },
  { name: 'mobilesecurity', port: 4037 },
  { name: 'iotsecure', port: 4038 },
  { name: 'supplychainsec', port: 4039 },
  { name: 'brandprotect', port: 4040 },
  { name: 'datalossprevention', port: 4041 },
  { name: 'userbehavioranalytics', port: 4042 },
  { name: 'threatmodeling', port: 4043 },
  { name: 'redteamsim', port: 4044 },
  { name: 'blueteamops', port: 4045 },
  { name: 'purpleteamhub', port: 4046 },
  { name: 'cyberinsurance', port: 4047 },
  { name: 'securityawareness', port: 4048 },
  { name: 'vendorriskmgmt', port: 4049 },
  { name: 'cyberthreatmap', port: 4050 }
];

// Register all tool proxies with auth + access control middleware
tools.forEach(tool => {
  router.use(
    `/${tool.name}`,
    authMiddleware,
    checkToolAccessFromRoute, // Verify user has paid for 24h access
    apiLimiter,
    createToolProxy(tool.name, tool.port)
  );
});

module.exports = router;
