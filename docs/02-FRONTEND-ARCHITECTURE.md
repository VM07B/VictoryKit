# 🎨 Frontend Architecture - MAULA.AI

## 🏗️ Frontend Structure

```
FRONTEND ARCHITECTURE
│
├─ 🏠 Main Dashboard (maula.ai)
│   ├─ Landing Page
│   ├─ All 50 Tools Grid
│   ├─ Tool Detail Pages (/tools/[toolId])
│   ├─ User Profile
│   ├─ API Keys Management
│   └─ Billing Dashboard
│
└─ 🛡️ 50 Independent Tool Frontends
    ├─ Each tool = Standalone Next.js app
    ├─ Each tool = Neural Link Interface + Tool-specific UI
    ├─ Own subdomain (fguard.maula.ai, ipintel.maula.ai)
    └─ No shared components between tools (complete isolation)
```

---

## 🪟 Neural Link Interface - The Core AI Window

**CRITICAL:** Every tool is built on the **Neural Link Interface** - a Matrix-themed autonomous AI workspace that transforms static tools into conversational, multi-tab AI agents.

### Neural Link Interface Architecture

```
Neural Link Interface (Base Template)
│
├─ 🎨 Core Components/
│   ├─ App.tsx                  # Main React application (324 lines)
│   ├─ Header.tsx               # LLM selector, settings, tool title, user menu
│   ├─ Sidebar.tsx              # Chat session management, create/switch sessions
│   ├─ ChatBox.tsx              # Message display, input field, voice controls (309 lines)
│   ├─ SettingsPanel.tsx        # AI configuration (model, temp, tokens, etc.)
│   ├─ NavigationDrawer.tsx     # Tool-specific navigation menu
│   ├─ WebPortal.tsx            # Embedded browser (AI can navigate URLs)
│   ├─ CanvasWorkspace.tsx      # Code/document editor (AI can create/edit)
│   └─ TabManager.tsx           # Multi-tab workspace (autonomous agent feature)
│
├─ 🔧 Services/
│   ├─ geminiService.ts         # Google Gemini API integration (125 lines)
│   ├─ claudeService.ts         # Anthropic Claude integration
│   ├─ openaiService.ts         # OpenAI GPT-4 integration
│   ├─ xaiService.ts            # xAI Grok integration
│   ├─ mistralService.ts        # Mistral AI integration
│   ├─ llamaService.ts          # Meta Llama integration (via Together AI)
│   ├─ functionCalling.ts       # Tool-specific AI function declarations
│   └─ websocketService.ts      # Real-time communication
│
├─ 📦 Types/
│   ├─ types.ts                 # Core types: Message, ChatSession, SettingsState
│   │                           # WorkspaceMode, CanvasState, Tab interface
│   └─ toolTypes.ts             # Tool-specific type definitions
│
├─ 🎯 Configuration/
│   ├─ constants.tsx            # LLM provider configs, default settings
│   ├─ neuralPresets.ts         # Pre-configured AI modes (browser, thinking, deep_research)
│   └─ toolConfig.json          # Tool-specific AI training, function declarations
│
├─ 🎨 Styling/
│   ├─ App.css                  # Matrix cyberpunk theme (dark + neon green/blue)
│   └─ tailwind.config.js       # Extended Tailwind with custom cyber colors
│
└─ 📄 Metadata/
    ├─ package.json             # Dependencies: React 19, @google/genai, lucide-react
    └─ metadata.json            # Tool branding, description, version
```

### Neural Link Interface Features

**1. Multi-LLM Support (6 Providers)**
```typescript
// User can switch AI providers mid-conversation
const providers = {
  gemini: { name: 'Google Gemini 2.0 Flash', models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro'] },
  claude: { name: 'Anthropic Claude', models: ['claude-3-5-sonnet-20241022', 'claude-3-opus'] },
  gpt: { name: 'OpenAI GPT', models: ['gpt-4o', 'gpt-4-turbo', 'o1'] },
  grok: { name: 'xAI Grok', models: ['grok-2-1212', 'grok-2-vision'] },
  mistral: { name: 'Mistral AI', models: ['mistral-large', 'mixtral-8x7b'] },
  llama: { name: 'Meta Llama', models: ['llama-3.3-70b', 'llama-3.1-405b'] }
};
```

**2. Multi-Session Chat Management**
```typescript
// Users can create multiple chat sessions per tool
interface ChatSession {
  id: string;
  name: string;
  active: boolean;
  messages: Message[];
  settings: SettingsState;
  timestamp: number;
}
// Stored in localStorage, persisted across visits
```

**3. Workspace Modes**
```typescript
type WorkspaceMode = 'CHAT' | 'PORTAL' | 'CANVAS';

// CHAT: Standard conversational interface
// PORTAL: AI navigates to URLs, displays web content
// CANVAS: AI creates/edits code, documents, diagrams
```

**4. Function Calling (Tool-Specific Actions)**
```typescript
// Example: FraudGuard AI Functions
const fraudGuardFunctions = [
  {
    name: 'analyze_transaction',
    description: 'Analyze transaction for fraud risk',
    parameters: {
      type: 'object',
      properties: {
        transaction_id: { type: 'string' },
        amount: { type: 'number' },
        user_ip: { type: 'string' },
        device_fingerprint: { type: 'string' }
      }
    }
  },
  {
    name: 'get_fraud_score',
    description: 'Calculate fraud risk score 0-100',
    parameters: { /* ... */ }
  },
  {
    name: 'open_risk_visualization',
    description: 'Open new tab with risk graphs',
    parameters: { /* ... */ }
  }
];
```

**5. Autonomous Multi-Tab Agent**
```typescript
// AI can open multiple tabs and perform tasks autonomously
interface Tab {
  id: string;
  title: string;
  type: 'tool' | 'browser' | 'canvas' | 'terminal';
  content: any;
  active: boolean;
}

// User: "Analyze this transaction and show me the risk report"
// AI autonomously:
//   1. Opens transaction analysis tab
//   2. Runs fraud detection API
//   3. Opens risk visualization tab (graphs/charts)
//   4. Creates report in canvas tab
//   5. User "sits back, relaxes, eats popcorn"
```

**6. Voice Interaction**
```typescript
// Speech-to-Text and Live Audio
interface VoiceFeatures {
  stt: boolean;              // Speech-to-Text (one-time input)
  liveAudio: boolean;        // Real-time voice conversation
  voiceLanguage: string;     // Support multiple languages
}
```

---

## 📂 Frontend Directory Structure (COMPLETE)

```
frontend/
│
├─ neural-link-interface/             # 🪟 Base Template for All Tools
│   ├─ src/
│   │   ├─ App.tsx                    # Main app (324 lines) - Multi-session management
│   │   ├─ types.ts                   # TypeScript interfaces
│   │   ├─ constants.tsx              # LLM configs, defaults, neural presets
│   │   ├─ components/
│   │   │   ├─ Header.tsx             # Top bar: LLM selector, settings, title
│   │   │   ├─ Sidebar.tsx            # Session manager, chat history
│   │   │   ├─ ChatBox.tsx            # Message display, input, voice (309 lines)
│   │   │   ├─ SettingsPanel.tsx      # AI configuration panel
│   │   │   ├─ NavigationDrawer.tsx   # Tool navigation menu
│   │   │   ├─ WebPortal.tsx          # Embedded browser
│   │   │   ├─ CanvasWorkspace.tsx    # Code/doc editor
│   │   │   └─ TabManager.tsx         # Multi-tab workspace
│   │   ├─ services/
│   │   │   ├─ geminiService.ts       # Google Gemini API (125 lines)
│   │   │   ├─ claudeService.ts       # Anthropic Claude API
│   │   │   ├─ openaiService.ts       # OpenAI GPT API
│   │   │   ├─ xaiService.ts          # xAI Grok API
│   │   │   ├─ mistralService.ts      # Mistral AI API
│   │   │   ├─ llamaService.ts        # Meta Llama API
│   │   │   ├─ functionCalling.ts     # Function declaration engine
│   │   │   └─ websocketService.ts    # Real-time WebSocket
│   │   └─ utils/
│   │       ├─ storage.ts             # localStorage management
│   │       ├─ markdown.ts            # Markdown rendering
│   │       └─ voice.ts               # STT/Live audio utilities
│   ├─ App.css                        # Matrix cyberpunk theme
│   ├─ package.json                   # React 19, @google/genai, lucide-react
│   ├─ vite.config.ts                 # Vite build config
│   ├─ tailwind.config.js             # Custom cyber theme
│   ├─ tsconfig.json                  # TypeScript config
│   └─ metadata.json                  # Project metadata
│
├─ main-dashboard/                    # 🏠 Central MAULA.AI Site
│   ├─ app/
│   │   ├─ layout.tsx                 # Root layout
│   │   ├─ page.tsx                   # Homepage (50 tool cards)
│   │   ├─ (auth)/
│   │   │   ├─ login/page.tsx         # Login page
│   │   │   ├─ register/page.tsx      # Registration
│   │   │   └─ forgot-password/page.tsx
│   │   ├─ tools/
│   │   │   └─ [toolId]/page.tsx      # Tool detail page (intro + "Access Tool" button)
│   │   ├─ dashboard/page.tsx         # User dashboard
│   │   ├─ profile/page.tsx           # User profile
│   │   ├─ api-keys/page.tsx          # API key management
│   │   ├─ billing/page.tsx           # Subscription & billing
│   │   └─ analytics/page.tsx         # Usage analytics
│   ├─ components/
│   │   ├─ Navbar.tsx                 # Top navigation
│   │   ├─ Sidebar.tsx                # Side menu
│   │   ├─ ToolCard.tsx               # Tool card in grid
│   │   ├─ Footer.tsx                 # Footer links
│   │   └─ ui/                        # Shadcn UI components
│   │       ├─ button.tsx
│   │       ├─ card.tsx
│   │       ├─ dialog.tsx
│   │       └─ ... (reusable UI)
│   ├─ lib/
│   │   ├─ auth.ts                    # Auth utilities (JWT handling)
│   │   ├─ api.ts                     # API client (axios/fetch)
│   │   └─ utils.ts                   # Helper functions
│   ├─ styles/
│   │   └─ globals.css                # Global styles
│   ├─ public/
│   │   ├─ logos/                     # Tool logos
│   │   └─ images/                    # Marketing images
│   ├─ package.json
│   ├─ next.config.js                 # Next.js 14 config
│   ├─ tailwind.config.js             # Tailwind theme
│   └─ tsconfig.json
│
│
├─ tools/                             # 🛡️ 50 Individual Tool Applications
│   ├─ 01-fraudguard/                 # Tool 1: FraudGuard (COMPLETE EXAMPLE)
│   │   ├─ src/
│   │   │   ├─ App.tsx                # Copied from neural-link-interface + customizations
│   │   │   ├─ types.ts               # + FraudGuard-specific types
│   │   │   ├─ constants.tsx          # + Fraud analysis presets
│   │   │   ├─ components/
│   │   │   │   ├─ Header.tsx         # (from neural-link) + FraudGuard branding
│   │   │   │   ├─ Sidebar.tsx        # (from neural-link)
│   │   │   │   ├─ ChatBox.tsx        # (from neural-link)
│   │   │   │   ├─ SettingsPanel.tsx  # (from neural-link)
│   │   │   │   ├─ NavigationDrawer.tsx  # + FraudGuard menu items
│   │   │   │   ├─ WebPortal.tsx      # (from neural-link)
│   │   │   │   ├─ CanvasWorkspace.tsx   # (from neural-link)
│   │   │   │   ├─ TabManager.tsx     # (from neural-link)
│   │   │   │   │
│   │   │   │   ├─ TransactionForm.tsx    # 🔧 Tool-Specific UI
│   │   │   │   ├─ FraudScoreCard.tsx     # Shows fraud risk 0-100
│   │   │   │   ├─ RiskVisualization.tsx  # Graphs, charts, heat maps
│   │   │   │   ├─ TransactionHistory.tsx # Past analyses
│   │   │   │   ├─ AlertsPanel.tsx        # High-risk alerts
│   │   │   │   └─ ExportReport.tsx       # PDF/CSV export
│   │   │   │
│   │   │   ├─ services/
│   │   │   │   ├─ geminiService.ts   # (from neural-link)
│   │   │   │   ├─ claudeService.ts   # (from neural-link)
│   │   │   │   ├─ openaiService.ts   # (from neural-link)
│   │   │   │   ├─ xaiService.ts      # (from neural-link)
│   │   │   │   ├─ mistralService.ts  # (from neural-link)
│   │   │   │   ├─ llamaService.ts    # (from neural-link)
│   │   │   │   ├─ fraudguard-tools.ts    # 🔧 AI Function Declarations
│   │   │   │   │   # Functions: analyze_transaction(), get_fraud_score(),
│   │   │   │   │   #            open_risk_graph(), export_report(), etc.
│   │   │   │   ├─ fraudguardAPI.ts   # Backend API calls
│   │   │   │   └─ websocketService.ts # (from neural-link)
│   │   │   │
│   │   │   └─ utils/
│   │   │       ├─ storage.ts         # (from neural-link)
│   │   │       ├─ markdown.ts        # (from neural-link)
│   │   │       ├─ voice.ts           # (from neural-link)
│   │   │       └─ fraudCalculations.ts  # 🔧 Fraud-specific utils
│   │   │
│   │   ├─ App.css                    # Matrix theme + FraudGuard red accents
│   │   ├─ package.json               # React 19 + tool-specific deps
│   │   ├─ vite.config.ts
│   │   ├─ tailwind.config.js         # Custom FraudGuard color palette
│   │   ├─ tsconfig.json
│   │   ├─ Dockerfile                 # Deploy to fguard.maula.ai
│   │   └─ fraudguard-config.json     # 🔧 AI System Prompt:
│   │       # "You are FraudGuard AI, expert in transaction fraud detection.
│   │       #  You can analyze transactions, calculate risk scores, identify
│   │       #  suspicious patterns, and generate fraud reports..."
│   │
│   ├─ 02-smartscore/                 # Tool 2: SmartScore (Same Structure)
│   │   ├─ src/
│   │   │   ├─ App.tsx                # (copied from neural-link)
│   │   │   ├─ components/
│   │   │   │   ├─ ... (neural-link components)
│   │   │   │   ├─ ScoreCalculator.tsx    # 🔧 SmartScore-specific
│   │   │   │   ├─ ScoreHistory.tsx
│   │   │   │   └─ TrendAnalysis.tsx
│   │   │   └─ services/
│   │   │       ├─ ... (neural-link services)
│   │   │       └─ smartscore-tools.ts    # 🔧 AI Functions for SmartScore
│   │   ├─ App.css                    # Matrix + SmartScore blue/purple
│   │   └─ smartscore-config.json     # 🔧 "You are SmartScore AI..."
│   │
│   ├─ 03-checkoutshield/
│   ├─ 04-fraudflow/
│   ├─ 05-riskengine/
│   ├─ 06-deviceprint/
│   ├─ 07-trustdevice/
│   ├─ 08-bioscan/
│   ├─ 09-multiauth/
│   ├─ 10-verifyme/
│   ├─ 11-ipintel/                    # Tool 11: IPIntel (COMPLETE EXAMPLE)
│   │   ├─ src/
│   │   │   ├─ App.tsx                # (copied from neural-link)
│   │   │   ├─ components/
│   │   │   │   ├─ ... (neural-link components)
│   │   │   │   ├─ IPInputForm.tsx        # 🔧 IP address input
│   │   │   │   ├─ IPAnalysisCard.tsx     # Location, ISP, risk
│   │   │   │   ├─ GeolocationMap.tsx     # Interactive world map
│   │   │   │   ├─ ProxyDetection.tsx     # VPN/proxy indicators
│   │   │   │   └─ IPHistoryLog.tsx       # Past IP lookups
│   │   │   └─ services/
│   │   │       ├─ ... (neural-link services)
│   │   │       └─ ipintel-tools.ts       # 🔧 AI Functions:
│   │   │           # analyze_ip(), check_proxy(), get_geolocation(),
│   │   │           # detect_vpn(), show_ip_map(), etc.
│   │   ├─ App.css                    # Matrix + IPIntel cyan/green
│   │   └─ ipintel-config.json        # 🔧 "You are IPIntel AI, expert in IP analysis..."
│   │
│   ├─ 12-proxydetect/
│   ├─ 13-georisk/
│   ├─ 14-ipscore/
│   ├─ 15-fraudcheck/
│   ├─ 16-paymentshield/
│   ├─ 17-transactguard/
│   ├─ 18-revenuedefense/
│   ├─ 19-smartpayment/
│   ├─ 20-idverify/
│   ├─ 21-globalkyc/
│   ├─ 22-identityai/
│   ├─ 23-agecheck/
│   ├─ 24-botshield/
│   ├─ 25-challengedefense/
│   ├─ 26-antibot/
│   ├─ 27-humancheck/
│   ├─ 28-iosattest/
│   ├─ 29-androidverify/
│   ├─ 30-captchaplus/
│   ├─ 31-adaptivemfa/
│   ├─ 32-accessmanager/
│   ├─ 33-emailguard/
│   ├─ 34-phoneverify/
│   ├─ 35-contactscore/
│   ├─ 36-geofence/
│   ├─ 37-travelrisk/
│   ├─ 38-vpndetect/
│   ├─ 39-socialverify/
│   ├─ 40-digitalfootprint/
│   ├─ 41-accountage/
│   ├─ 42-cryptorisk/
│   ├─ 43-walletcheck/
│   ├─ 44-chainanalytics/
│   ├─ 45-docscan/
│   ├─ 46-facematch/
│   ├─ 47-livenesscheck/
│   ├─ 48-multiaccountdetect/
│   ├─ 49-velocitycheck/
│   └─ 50-sessionguard/
│
└─ shared-types/                      # Only TypeScript types (NO components shared)
    ├─ api.d.ts                       # API response types
    ├─ auth.d.ts                      # Auth types
    └─ common.d.ts                    # Common interfaces
```

---

## 🔧 Tool Customization Pattern

### How to Create a Tool from Neural Link Interface

**Step 1: Copy Base Template**
```bash
cp -r neural-link-interface/ tools/01-fraudguard/
cd tools/01-fraudguard/
```

**Step 2: Customize AI Configuration**
```json
// fraudguard-config.json
{
  "toolName": "FraudGuard",
  "subdomain": "fguard.maula.ai",
  "systemPrompt": "You are FraudGuard AI, an expert fraud detection assistant. You help users analyze transactions, detect suspicious patterns, calculate fraud risk scores, and generate detailed fraud reports. You have access to real-time fraud detection APIs and machine learning models.",
  "functions": [
    {
      "name": "analyze_transaction",
      "description": "Analyze a transaction for fraud indicators",
      "parameters": {
        "type": "object",
        "properties": {
          "transaction_id": { "type": "string", "description": "Unique transaction ID" },
          "amount": { "type": "number", "description": "Transaction amount in USD" },
          "user_ip": { "type": "string", "description": "User's IP address" },
          "device_fingerprint": { "type": "string", "description": "Device fingerprint hash" },
          "email": { "type": "string", "description": "User email address" },
          "card_last4": { "type": "string", "description": "Last 4 digits of card" }
        },
        "required": ["transaction_id", "amount"]
      }
    },
    {
      "name": "get_fraud_score",
      "description": "Calculate fraud risk score 0-100",
      "parameters": { /* ... */ }
    },
    {
      "name": "open_risk_visualization",
      "description": "Open new tab with risk graphs and charts",
      "parameters": { /* ... */ }
    }
  ],
  "colorTheme": {
    "primary": "#ff0055",      // Neon red for fraud alerts
    "secondary": "#00d4ff",    // Neon blue
    "accent": "#ffdd00"        // Neon yellow for warnings
  },
  "navigationItems": [
    { "label": "Fraud Analysis", "path": "/analyze" },
    { "label": "Transaction History", "path": "/history" },
    { "label": "Risk Dashboard", "path": "/dashboard" },
    { "label": "Alerts", "path": "/alerts" },
    { "label": "Settings", "path": "/settings" }
  ]
}
```

**Step 3: Add Tool-Specific UI Components**
```typescript
// components/TransactionForm.tsx
export const TransactionForm: React.FC = () => {
  return (
    <div className="tool-interface">
      <h2>Analyze Transaction</h2>
      <input placeholder="Transaction ID" />
      <input placeholder="Amount" type="number" />
      <input placeholder="User IP" />
      <input placeholder="Device Fingerprint" />
      <button onClick={analyzeTransaction}>Analyze Fraud Risk</button>
    </div>
  );
};
```

**Step 4: Implement Tool-Specific AI Functions**
```typescript
// services/fraudguard-tools.ts
export const fraudguardFunctions = {
  async analyze_transaction(args: any) {
    const response = await fetch('/api/fraudguard/analyze', {
      method: 'POST',
      body: JSON.stringify(args)
    });
    return response.json();
  },
  
  async get_fraud_score(transactionId: string) {
    const response = await fetch(`/api/fraudguard/score/${transactionId}`);
    return response.json();
  },
  
  async open_risk_visualization(transactionId: string) {
    // Open new tab with risk graphs
    window.open(`/risk-viz/${transactionId}`, '_blank');
  }
};
```

**Step 5: Update Branding**
```typescript
// App.tsx - Line 15
const TOOL_NAME = 'FraudGuard';
const TOOL_TAGLINE = 'AI-Powered Fraud Detection';
const TOOL_LOGO = '/logos/fraudguard.svg';
```

**Step 6: Deploy to Subdomain**
```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "preview"]
```

```nginx
# Nginx config for fguard.maula.ai
server {
    listen 443 ssl;
    server_name fguard.maula.ai;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🎨 Standard Tool Frontend Structure (Complete File List)

### 1. ToolInterface.tsx
```typescript
// Main interface where user interacts with the tool
// Example: IP address input, fraud score display, etc.

interface ToolInterfaceProps {
  onSubmit: (data: any) => void;
  loading: boolean;
  result: any;
}
```

### 2. AIAssistant.tsx
```typescript
// Conversational AI chat interface
// User can ask questions, get help, configure settings

interface AIAssistantProps {
  toolName: string;
  context: any;  // Current tool data/results
  onSendMessage: (message: string) => void;
  messages: Message[];
  llmProvider: 'claude' | 'gpt' | 'grok' | 'mistral' | 'gemini';
}
```

### 3. LLMSelector.tsx
```typescript
// Let user choose AI provider

interface LLMSelectorProps {
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
  availableProviders: LLMProvider[];
}
```

### 4. ResultDisplay.tsx
```typescript
// Display tool analysis results
// Charts, scores, risk indicators, etc.

interface ResultDisplayProps {
  data: any;
  visualizationType: 'chart' | 'table' | 'map' | 'graph';
}
```

---

## 🎨 UI Design System

### Color Palette (Dark + Neon Cyber Theme)
```css
:root {
  /* Dark Base */
  --bg-primary: #0a0e27;
  --bg-secondary: #151934;
  --bg-card: #1a1f3a;
  
  /* Neon Accents */
  --neon-blue: #00d4ff;
  --neon-purple: #b759ff;
  --neon-green: #00ff88;
  --neon-red: #ff0055;
  --neon-yellow: #ffdd00;
  
  /* Text */
  --text-primary: #ffffff;
  --text-secondary: #a0aec0;
  --text-muted: #718096;
}
```

### Typography
```css
/* Headers */
font-family: 'Inter', 'Roboto', sans-serif;

/* Code */
font-family: 'JetBrains Mono', 'Fira Code', monospace;
```

### Component Styles
- **Cards**: Glass-morphism effect with neon borders
- **Buttons**: Gradient hover effects
- **Inputs**: Neon focus glow
- **Charts**: Animated, gradient fills
- **AI Chat**: Cyberpunk message bubbles

---

## 🔄 State Management

### Per-Tool State (React Context + Zustand)
```typescript
// Example: IPIntel Tool State

interface IPIntelState {
  currentIP: string;
  analysis: IPAnalysis | null;
  loading: boolean;
  aiMessages: Message[];
  selectedLLM: LLMProvider;
  chatHistory: ChatSession[];
  apiKey: string;
}

const useIPIntelStore = create<IPIntelState>((set) => ({
  // ... state management
}));
```

---

## 🌐 Routing Strategy

### Main Dashboard
```
maula.ai/                → Landing
maula.ai/login           → Login
maula.ai/register        → Register
maula.ai/dashboard       → User dashboard
maula.ai/tools           → All tools grid
maula.ai/profile         → User profile
maula.ai/api-keys        → API key management
maula.ai/billing         → Billing
```

### Individual Tools (Subdomains)
```
fraudguard.maula.ai/             → Tool home
fraudguard.maula.ai/dashboard    → Analytics
fraudguard.maula.ai/settings     → Configuration
fraudguard.maula.ai/api-docs     → API docs
```

---

## ⚡ Performance Optimization

1. **Code Splitting**: Each tool loads independently
2. **Lazy Loading**: Components load on demand
3. **Image Optimization**: Next.js Image component
4. **Caching**: SWR for API data caching
5. **SSR/SSG**: Server-side rendering for SEO
6. **WebSocket**: Real-time AI chat (no polling)

---

## 📱 Responsive Design

- **Desktop**: Full dashboard with sidebars
- **Tablet**: Collapsible navigation
- **Mobile**: Bottom navigation, stacked layout

---

## 🔐 Frontend Security

1. **JWT Storage**: HttpOnly cookies
2. **CSRF Protection**: Token validation
3. **XSS Prevention**: Sanitize user inputs
4. **API Key Masking**: Show only last 4 digits
5. **Rate Limiting**: Client-side throttling

---

## 📋 Implementation Checklist

### Phase 1: Setup Neural Link Interface Base
- [ ] Copy `/neural-link-interface/` to project root
- [ ] Install dependencies: `npm install` in neural-link-interface/
- [ ] Test base interface locally: `npm run dev`
- [ ] Verify all 6 LLM providers work (API keys configured)
- [ ] Test multi-session chat functionality
- [ ] Test voice features (STT, Live Audio)
- [ ] Test workspace modes (CHAT, PORTAL, CANVAS)
- [ ] Verify function calling with test functions

### Phase 2: Build Main Dashboard (maula.ai)
- [ ] Create `/frontend/main-dashboard/` with Next.js 14
- [ ] Install dependencies: React 19, TailwindCSS, lucide-react
- [ ] Build homepage with 50 tool cards (grid layout)
- [ ] Create `/tools/[toolId]/page.tsx` for tool detail pages
- [ ] Build auth pages (login, register, forgot-password)
- [ ] Integrate with auth-service API (JWT handling)
- [ ] Build user dashboard (profile, API keys, billing)
- [ ] Add analytics page (usage stats, graphs)
- [ ] Deploy to maula.ai (Docker + Nginx)

### Phase 3: Build First Tool (FraudGuard)
- [ ] Copy neural-link-interface to `/frontend/tools/01-fraudguard/`
- [ ] Customize `fraudguard-config.json`:
  - [ ] Set system prompt for FraudGuard AI
  - [ ] Define AI function declarations (analyze_transaction, get_fraud_score, etc.)
  - [ ] Configure color theme (neon red for fraud alerts)
  - [ ] Add navigation items
- [ ] Create tool-specific UI components:
  - [ ] `TransactionForm.tsx` - Input transaction data
  - [ ] `FraudScoreCard.tsx` - Display fraud risk 0-100
  - [ ] `RiskVisualization.tsx` - Graphs, charts, heat maps
  - [ ] `TransactionHistory.tsx` - Past analyses
  - [ ] `AlertsPanel.tsx` - High-risk alerts
  - [ ] `ExportReport.tsx` - PDF/CSV export
- [ ] Implement `fraudguard-tools.ts` (AI function handlers)
- [ ] Connect to fraudguard-backend API endpoints
- [ ] Test AI conversation flow end-to-end
- [ ] Test multi-tab autonomous agent features
- [ ] Create Dockerfile for deployment
- [ ] Deploy to fguard.maula.ai (Docker + Nginx subdomain)

### Phase 4: Replicate to Remaining 49 Tools
- [ ] Create script to copy tool template: `./scripts/create-tool.sh [toolName]`
- [ ] For each tool (02-50):
  - [ ] Run script to copy neural-link-interface
  - [ ] Update tool-config.json (systemPrompt, functions, colors, nav)
  - [ ] Create tool-specific UI components
  - [ ] Implement tool-specific AI functions
  - [ ] Connect to tool backend APIs
  - [ ] Test AI functionality
  - [ ] Deploy to [toolname].maula.ai
- [ ] Verify all 50 subdomains are accessible
- [ ] Test SSO works across all subdomains

### Phase 5: Testing & Optimization
- [ ] E2E testing with Playwright (auth flow, AI chat, multi-tab)
- [ ] Performance testing (Lighthouse scores > 90)
- [ ] Security audit (XSS, CSRF, JWT validation)
- [ ] Accessibility testing (WCAG 2.1 AA compliance)
- [ ] Mobile responsiveness testing (all 50 tools)
- [ ] Load testing (concurrent users, AI requests)
- [ ] Browser compatibility testing (Chrome, Firefox, Safari, Edge)

---

**Status:** ✅ **Documentation Complete** → 🚀 **Ready to Build Main Dashboard**  
**Next Document:** [03-BACKEND-ARCHITECTURE.md](./03-BACKEND-ARCHITECTURE.md)

**Next:** Backend Architecture Design
