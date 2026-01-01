import { SettingsState, NavItem } from "./types";

// Production environment detection
const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';

export const PROVIDER_CONFIG = [
  {
    id: "gemini",
    name: "Google Gemini",
    models: [
      "gemini-3-flash-preview",
      "gemini-3-pro-preview",
      "gemini-2.5-flash-lite-latest",
      "gemini-2.5-flash-native-audio-preview-09-2025",
      "gemini-2.5-flash-image",
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    models: ["gpt-4o", "gpt-4-turbo", "o1-preview", "gpt-4o-mini"],
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
  },
];

// FraudGuard System Prompt - Enterprise Grade
export const FRAUDGUARD_SYSTEM_PROMPT = `You are FraudGuard AI, a world-class enterprise fraud detection specialist powered by advanced machine learning and real-time threat intelligence.

CORE CAPABILITIES:
1. TRANSACTION ANALYSIS: Deep analysis of payment transactions using ML models, behavioral analytics, and device fingerprinting
2. RISK SCORING: Calculate precise fraud risk scores (0-100) with confidence intervals and explainable AI
3. PATTERN DETECTION: Identify fraud rings, velocity attacks, account takeovers, and synthetic identity fraud
4. THREAT INTELLIGENCE: Real-time integration with global threat feeds, IP reputation, and known fraud databases
5. COMPLIANCE: PCI-DSS, SOX, GDPR, PSD2 SCA compliance monitoring and reporting

ANALYSIS FRAMEWORK:
- Device Intelligence: Browser fingerprint, device ID, emulator detection, VPN/proxy detection
- Behavioral Biometrics: Typing patterns, mouse movements, session behavior anomalies
- Network Analysis: IP geolocation, ASN reputation, datacenter detection, TOR exit nodes
- Identity Verification: Email age, phone validation, address verification, document analysis
- Payment Intelligence: Card BIN analysis, velocity checks, amount patterns, merchant risk

OUTPUT FORMAT:
- Always provide structured risk assessments with severity levels
- Include actionable recommendations with priority ranking
- Reference specific fraud indicators with confidence scores
- Suggest automation rules when patterns are detected

You can autonomously execute multi-step fraud investigations, open visualization tabs, generate reports, and integrate with external threat intelligence APIs.`;

export const DEFAULT_SETTINGS: SettingsState = {
  customPrompt: FRAUDGUARD_SYSTEM_PROMPT,
  agentName: "FraudGuard AI",
  temperature: 0.3,
  maxTokens: 4096,
  provider: "gemini",
  model: "gemini-3-pro-preview",
  activeTool: "none",
  workspaceMode: "CHAT",
  portalUrl: "https://maula.ai",
  canvas: {
    content:
      "// FRAUDGUARD NEURAL WORKSPACE\n// Real-time fraud analysis and threat detection\n\n🛡️ System Ready | Threat Level: NORMAL",
    type: "text",
    title: "FraudGuard_Workspace",
  },
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Fraud Analysis",
    icon: "🛡️",
    tool: "thinking",
    description: "Deep fraud pattern analysis",
  },
  {
    label: "Threat Research",
    icon: "🔭",
    tool: "deep_research",
    description: "Multi-source threat intelligence",
  },
  {
    label: "Live Monitoring",
    icon: "📡",
    tool: "browser",
    description: "Real-time transaction stream",
  },
  {
    label: "Risk Dashboard",
    icon: "📊",
    tool: "canvas",
    description: "Interactive risk visualization",
  },
  {
    label: "Threat Intel",
    icon: "🔍",
    tool: "web_search",
    description: "Global threat database search",
  },
  {
    label: "Compliance",
    icon: "📋",
    tool: "study",
    description: "Regulatory compliance checks",
  },
  {
    label: "Reports",
    icon: "📝",
    tool: "quizzes",
    description: "Generate fraud reports",
  },
  {
    label: "AI Image Analysis",
    icon: "🎯",
    tool: "image_gen",
    description: "Document & ID verification",
  },
];

// Production API Endpoints - Using subdomain proxy
export const API_ENDPOINTS = {
  FRAUDGUARD_API: isProduction ? "/api" : "/api",
  ML_API: isProduction ? "/api/ml" : "/api/ml",
  AI_API: isProduction ? "/api/ai" : "/api/ai",
  WS_API: isProduction ? "wss://fguard.maula.ai/ws" : "wss://fguard.maula.ai/ws",
  GATEWAY_API: "https://api.maula.ai",
  AUTH_API: "https://api.maula.ai/auth",
};

// External Threat Intelligence Endpoints
export const THREAT_INTEL_ENDPOINTS = {
  VIRUSTOTAL: "https://www.virustotal.com/api/v3",
  ABUSEIPDB: "https://api.abuseipdb.com/api/v2",
  SHODAN: "https://api.shodan.io",
  IPQS: "https://ipqualityscore.com/api/json",
  MAXMIND: "https://geoip.maxmind.com/geoip/v2.1",
  EMAILREP: "https://emailrep.io",
  HIBP: "https://haveibeenpwned.com/api/v3",
};

// Fraud Risk Thresholds
export const RISK_THRESHOLDS = {
  LOW: { min: 0, max: 25, color: "#10B981", label: "Low Risk" },
  MEDIUM: { min: 26, max: 50, color: "#F59E0B", label: "Medium Risk" },
  HIGH: { min: 51, max: 75, color: "#F97316", label: "High Risk" },
  CRITICAL: { min: 76, max: 100, color: "#EF4444", label: "Critical Risk" },
};

// Fraud Indicators Configuration
export const FRAUD_INDICATORS = {
  VELOCITY: {
    name: "Velocity Attack",
    description: "Multiple rapid transactions detected",
    weight: 25,
  },
  GEO_MISMATCH: {
    name: "Geographic Mismatch",
    description: "IP location doesn't match billing address",
    weight: 20,
  },
  DEVICE_ANOMALY: {
    name: "Device Anomaly",
    description: "Suspicious device fingerprint or emulator detected",
    weight: 30,
  },
  PROXY_VPN: {
    name: "Proxy/VPN Detection",
    description: "Connection through anonymizing service",
    weight: 15,
  },
  EMAIL_RISK: {
    name: "Email Risk",
    description: "Disposable or recently created email",
    weight: 20,
  },
  BIN_MISMATCH: {
    name: "BIN Mismatch",
    description: "Card issuer country mismatch",
    weight: 25,
  },
  AMOUNT_ANOMALY: {
    name: "Amount Anomaly",
    description: "Unusual transaction amount pattern",
    weight: 15,
  },
  TIME_ANOMALY: {
    name: "Time Anomaly",
    description: "Transaction at unusual hour",
    weight: 10,
  },
  ACCOUNT_AGE: {
    name: "New Account",
    description: "Account created very recently",
    weight: 20,
  },
  BLACKLIST_HIT: {
    name: "Blacklist Match",
    description: "IP/Email/Device on known fraud list",
    weight: 40,
  },
};

export const NEURAL_PRESETS: Record<string, { prompt: string; temp: number }> =
  {
    fraud_analyst: {
      prompt: "You are a senior fraud analyst with 15+ years experience in payment fraud detection, AML compliance, and risk management. Analyze transactions with extreme precision.",
      temp: 0.2,
    },
    threat_hunter: {
      prompt: "You are a threat intelligence specialist. Hunt for fraud patterns, track threat actors, and identify emerging attack vectors in real-time.",
      temp: 0.4,
    },
    compliance_officer: {
      prompt: "You are a compliance officer ensuring PCI-DSS, GDPR, PSD2, and SOX compliance. Focus on regulatory requirements and audit trails.",
      temp: 0.3,
    },
    incident_responder: {
      prompt: "You are a fraud incident responder. Act quickly to contain fraud attacks, trace attack paths, and coordinate response actions.",
      temp: 0.5,
    },
    ml_engineer: {
      prompt: "You are an ML engineer specializing in fraud detection models. Explain model decisions, feature importance, and suggest model improvements.",
      temp: 0.3,
    },
  };

// Real-time Alert Severity Levels
export const ALERT_SEVERITY = {
  INFO: { level: 1, color: "#3B82F6", sound: false },
  WARNING: { level: 2, color: "#F59E0B", sound: true },
  HIGH: { level: 3, color: "#F97316", sound: true },
  CRITICAL: { level: 4, color: "#EF4444", sound: true, escalate: true },
};

// Transaction Status Mapping
export const TRANSACTION_STATUS = {
  PENDING: { label: "Pending Review", color: "#F59E0B", icon: "clock" },
  APPROVED: { label: "Approved", color: "#10B981", icon: "check" },
  DECLINED: { label: "Declined", color: "#EF4444", icon: "x" },
  FLAGGED: { label: "Flagged for Review", color: "#F97316", icon: "flag" },
  BLOCKED: { label: "Blocked", color: "#DC2626", icon: "ban" },
  CHARGEBACK: { label: "Chargeback", color: "#7C3AED", icon: "rotate-ccw" },
};

// ML Model Configuration
export const ML_MODELS = {
  GRADIENT_BOOST: { name: "XGBoost Fraud Detector", version: "3.2.1", accuracy: 99.7 },
  NEURAL_NET: { name: "Deep Neural Network", version: "2.1.0", accuracy: 99.4 },
  RANDOM_FOREST: { name: "Random Forest Ensemble", version: "4.0.0", accuracy: 99.2 },
  AUTOENCODER: { name: "Anomaly Autoencoder", version: "1.5.0", accuracy: 98.9 },
};

// Dashboard Refresh Rates (ms)
export const REFRESH_RATES = {
  LIVE_TRANSACTIONS: 2000,
  RISK_METRICS: 5000,
  ALERTS: 3000,
  ANALYTICS: 30000,
};

// Geographic Risk Scores by Region
export const GEO_RISK_SCORES: Record<string, number> = {
  US: 10, CA: 10, UK: 10, DE: 10, FR: 10, AU: 10, JP: 10,
  BR: 25, MX: 25, IN: 20, CN: 30, RU: 40, NG: 45, PK: 35,
  VN: 30, PH: 25, ID: 25, UA: 35, BY: 40, IR: 50, KP: 60,
};

// Payment Method Risk Weights
export const PAYMENT_RISK_WEIGHTS = {
  CREDIT_CARD: 1.0,
  DEBIT_CARD: 0.8,
  APPLE_PAY: 0.6,
  GOOGLE_PAY: 0.6,
  PAYPAL: 0.7,
  CRYPTO: 1.5,
  WIRE_TRANSFER: 1.3,
  PREPAID_CARD: 1.4,
};
