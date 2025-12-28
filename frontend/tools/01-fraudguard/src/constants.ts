import { SettingsState, NavItem } from './types';

export const PROVIDER_CONFIG = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    models: ['gemini-2.5-flash-preview', 'gemini-2.5-pro-preview', 'gemini-2.0-flash']
  },
  {
    id: 'openai',
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4o-mini']
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    models: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307']
  },
  {
    id: 'xai',
    name: 'xAI Grok',
    models: ['grok-2', 'grok-2-mini']
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    models: ['mistral-large-latest', 'mistral-medium', 'mistral-small']
  },
  {
    id: 'meta',
    name: 'Meta Llama',
    models: ['llama-3.1-405b', 'llama-3.1-70b', 'llama-3.1-8b']
  }
];

export const DEFAULT_SETTINGS: SettingsState = {
  customPrompt: `You are FraudGuard AI, an expert in transaction fraud detection with deep knowledge of payment security, fraud patterns, risk analysis, and machine learning fraud models.

CAPABILITIES:
- Analyze transactions for fraud indicators and calculate risk scores (0-100)
- Detect suspicious patterns in transaction data
- Provide actionable recommendations for risk mitigation
- Generate detailed fraud reports
- Create alerts for high-risk transactions

AVAILABLE FUNCTIONS:
- analyze_transaction: Analyze a transaction for fraud indicators
- get_fraud_score: Get the fraud risk score for a transaction
- open_risk_visualization: Open charts and graphs for analysis
- get_transaction_history: Fetch transaction history with filters
- create_alert: Create fraud monitoring alerts
- export_report: Generate and export fraud reports

Always be thorough in your analysis and explain findings in clear, non-technical language.`,
  agentName: "FraudGuard AI",
  temperature: 0.7,
  maxTokens: 4096,
  provider: 'gemini',
  model: "gemini-2.5-flash-preview",
  activeTool: 'fraud_analysis',
  workspaceMode: 'CHAT',
  portalUrl: 'https://www.google.com/search?igu=1',
  canvas: {
    content: "// FraudGuard Workspace\n\nReady for fraud analysis.",
    type: 'text',
    title: 'FraudGuard_Canvas'
  }
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Fraud Analysis', icon: '🛡️', tool: 'fraud_analysis', description: 'Analyze transactions for fraud' },
  { label: 'Risk Dashboard', icon: '📊', tool: 'risk_visualization', description: 'View risk charts and graphs' },
  { label: 'Transaction History', icon: '📜', tool: 'transaction_history', description: 'Browse past transactions' },
  { label: 'Alerts', icon: '🔔', tool: 'alerts', description: 'Manage fraud alerts' },
  { label: 'Reports', icon: '📄', tool: 'reports', description: 'Generate fraud reports' },
  { label: 'Web Portal', icon: '🌐', tool: 'browser', description: 'Open web browser' },
  { label: 'Canvas', icon: '🖌️', tool: 'canvas', description: 'Collaborative workspace' },
  { label: 'Web Search', icon: '🔍', tool: 'web_search', description: 'Search the web' }
];

export const FRAUD_PRESETS: Record<string, { prompt: string; temp: number }> = {
  thorough: { 
    prompt: "Perform extremely detailed fraud analysis. Check every indicator, cross-reference patterns, and provide comprehensive risk assessment.", 
    temp: 0.3 
  },
  quick: { 
    prompt: "Perform quick fraud screening. Focus on major red flags and provide a rapid risk assessment.", 
    temp: 0.5 
  },
  educational: { 
    prompt: "Explain fraud analysis in educational terms. Help the user understand fraud patterns and detection methods.", 
    temp: 0.7 
  },
  investigative: { 
    prompt: "Take an investigative approach. Look for hidden patterns, connections, and potential fraud networks.", 
    temp: 0.4 
  }
};

export const RISK_COLORS = {
  low: '#00ff88',
  medium: '#ffaa00',
  high: '#ff0055'
};

export const API_ENDPOINTS = {
  fraudguard: {
    analyze: '/api/fraudguard/analyze',
    score: '/api/fraudguard/score',
    transactions: '/api/fraudguard/transactions',
    analytics: '/api/fraudguard/analytics',
    alerts: '/api/fraudguard/alerts',
    reports: '/api/fraudguard/reports'
  },
  ml: {
    predict: '/api/ml/predict',
    score: '/api/ml/score',
    train: '/api/ml/train'
  },
  ai: {
    chat: '/api/ai/chat',
    ws: '/ws/ai'
  }
};
