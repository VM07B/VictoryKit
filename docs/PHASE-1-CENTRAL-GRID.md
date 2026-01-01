# 🏗️ PHASE 1: Central Grid Station (Foundation)

**Goal:** Build the core infrastructure that all 50 tools depend on  
**Duration:** 1-2 weeks  
**Deliverables:** Auth Service, API Gateway, Main Landing Site, Infrastructure Setup

---

## 📋 What You'll Build in Phase 1

1. **Auth Service** (port 5000) - Authentication for all 50 tools
2. **API Gateway** (port 4000) - Request routing and rate limiting
3. **Main Landing Site** (port 3000, maula.ai) - Homepage with 50 tool cards
4. **MongoDB Atlas** - Database cluster with `maula_auth_db`
5. **Nginx Configuration** - Reverse proxy for all subdomains
6. **Cloudflare DNS** - Domain setup with wildcard for 50 subdomains

---

## 🌳 COMPLETE TREE MAP - Phase 1

```
VictoryKit/
│
├─ backend/
│   └─ shared-services/
│       │
│       ├─ auth-service/                      # 🔐 Authentication Service
│       │   ├─ src/
│       │   │   ├─ controllers/
│       │   │   │   ├─ authController.ts      # 250 lines - register, login, logout, refresh
│       │   │   │   ├─ userController.ts      # 180 lines - CRUD operations
│       │   │   │   └─ oauthController.ts     # 200 lines - Google, GitHub OAuth
│       │   │   │
│       │   │   ├─ middleware/
│       │   │   │   ├─ authMiddleware.ts      # 120 lines - JWT verification
│       │   │   │   ├─ rateLimiter.ts         # 80 lines - Redis rate limiting
│       │   │   │   ├─ corsMiddleware.ts      # 60 lines - CORS for 50 subdomains
│       │   │   │   └─ errorHandler.ts        # 100 lines - Global error handling
│       │   │   │
│       │   │   ├─ models/
│       │   │   │   ├─ User.ts                # 150 lines - User schema
│       │   │   │   ├─ Session.ts             # 80 lines - Session schema
│       │   │   │   ├─ ApiKey.ts              # 90 lines - API key schema
│       │   │   │   └─ Subscription.ts        # 120 lines - Billing schema
│       │   │   │
│       │   │   ├─ routes/
│       │   │   │   ├─ auth.ts                # 100 lines - /api/auth/register, /login, /logout
│       │   │   │   ├─ users.ts               # 120 lines - /api/users/:id (GET, PUT, DELETE)
│       │   │   │   ├─ oauth.ts               # 80 lines - /api/oauth/:provider
│       │   │   │   ├─ apiKeys.ts             # 100 lines - /api/api-keys (POST, GET, DELETE)
│       │   │   │   └─ sso.ts                 # 90 lines - SSO verification for subdomains
│       │   │   │
│       │   │   ├─ services/
│       │   │   │   ├─ jwtService.ts          # 150 lines - JWT sign/verify
│       │   │   │   ├─ oauthService.ts        # 200 lines - OAuth providers
│       │   │   │   ├─ emailService.ts        # 180 lines - Email verification, password reset
│       │   │   │   ├─ apiKeyService.ts       # 130 lines - Generate/validate API keys
│       │   │   │   └─ subscriptionService.ts # 200 lines - Billing logic
│       │   │   │
│       │   │   ├─ utils/
│       │   │   │   ├─ bcrypt.ts              # 50 lines - Password hashing
│       │   │   │   ├─ validator.ts           # 100 lines - Input validation
│       │   │   │   └─ logger.ts              # 80 lines - Winston logger
│       │   │   │
│       │   │   ├─ config/
│       │   │   │   ├─ database.ts            # 80 lines - MongoDB connection
│       │   │   │   ├─ redis.ts               # 60 lines - Redis connection
│       │   │   │   └─ env.ts                 # 100 lines - Environment variables
│       │   │   │
│       │   │   └─ server.ts                  # 120 lines - Express app setup
│       │   │
│       │   ├─ tests/
│       │   │   ├─ auth.test.ts               # 300 lines - Auth endpoint tests
│       │   │   ├─ user.test.ts               # 200 lines - User CRUD tests
│       │   │   └─ apiKey.test.ts             # 150 lines - API key tests
│       │   │
│       │   ├─ package.json                   # Dependencies
│       │   ├─ tsconfig.json                  # TypeScript config
│       │   ├─ .env.example                   # Environment variables template
│       │   ├─ .eslintrc.json                 # ESLint config
│       │   ├─ .prettierrc                    # Prettier config
│       │   ├─ Dockerfile                     # Docker image
│       │   └─ README.md                      # Auth service documentation
│       │
│       └─ api-gateway/                       # 🌐 API Gateway
│           ├─ src/
│           │   ├─ routes/
│           │   │   ├─ index.ts               # 150 lines - Master router
│           │   │   ├─ toolRoutes.ts          # 200 lines - Proxy to 50 tool backends
│           │   │   └─ healthCheck.ts         # 50 lines - /health endpoint
│           │   │
│           │   ├─ middleware/
│           │   │   ├─ rateLimit.ts           # 100 lines - Global rate limiting
│           │   │   ├─ apiKeyAuth.ts          # 120 lines - API key validation
│           │   │   ├─ jwtAuth.ts             # 80 lines - JWT token validation
│           │   │   ├─ cors.ts                # 60 lines - CORS configuration
│           │   │   └─ requestLogger.ts       # 80 lines - Log all requests
│           │   │
│           │   ├─ services/
│           │   │   ├─ proxyService.ts        # 180 lines - Proxy requests to tools
│           │   │   └─ loadBalancer.ts        # 150 lines - Load balancing
│           │   │
│           │   ├─ utils/
│           │   │   ├─ logger.ts              # 80 lines - Winston logger
│           │   │   └─ errorHandler.ts        # 100 lines - Error handling
│           │   │
│           │   ├─ config/
│           │   │   ├─ redis.ts               # 60 lines - Redis connection
│           │   │   └─ env.ts                 # 80 lines - Environment variables
│           │   │
│           │   └─ server.ts                  # 100 lines - Express app
│           │
│           ├─ package.json
│           ├─ tsconfig.json
│           ├─ .env.example
│           ├─ Dockerfile
│           └─ README.md
│
├─ frontend/
│   └─ main-dashboard/                        # 🏠 Main Landing Site (maula.ai)
│       ├─ app/
│       │   ├─ layout.tsx                     # Root layout
│       │   ├─ page.tsx                       # Homepage with 50 tool cards
│       │   │
│       │   ├─ (auth)/                        # Auth pages group
│       │   │   ├─ login/
│       │   │   │   └─ page.tsx               # Login page
│       │   │   ├─ register/
│       │   │   │   └─ page.tsx               # Registration page
│       │   │   └─ forgot-password/
│       │   │       └─ page.tsx               # Password reset
│       │   │
│       │   ├─ tools/
│       │   │   └─ [toolId]/
│       │   │       └─ page.tsx               # Tool detail page (dynamic route)
│       │   │
│       │   ├─ dashboard/
│       │   │   └─ page.tsx                   # User dashboard
│       │   │
│       │   ├─ profile/
│       │   │   └─ page.tsx                   # User profile
│       │   │
│       │   ├─ api-keys/
│       │   │   └─ page.tsx                   # API key management
│       │   │
│       │   ├─ billing/
│       │   │   └─ page.tsx                   # Subscription & billing
│       │   │
│       │   └─ analytics/
│       │       └─ page.tsx                   # Usage analytics
│       │
│       ├─ components/
│       │   ├─ Navbar.tsx                     # Top navigation
│       │   ├─ Sidebar.tsx                    # Side menu
│       │   ├─ ToolCard.tsx                   # Tool card component
│       │   ├─ Footer.tsx                     # Footer links
│       │   │
│       │   └─ ui/                            # Shadcn UI components
│       │       ├─ button.tsx
│       │       ├─ card.tsx
│       │       ├─ dialog.tsx
│       │       ├─ input.tsx
│       │       ├─ label.tsx
│       │       ├─ select.tsx
│       │       └─ toast.tsx
│       │
│       ├─ lib/
│       │   ├─ auth.ts                        # Auth utilities (JWT handling)
│       │   ├─ api.ts                         # API client (axios/fetch)
│       │   └─ utils.ts                       # Helper functions
│       │
│       ├─ styles/
│       │   └─ globals.css                    # Global styles (TailwindCSS)
│       │
│       ├─ public/
│       │   ├─ logos/                         # Tool logos (50 images)
│       │   │   ├─ fraudguard.svg
│       │   │   ├─ smartscore.svg
│       │   │   ├─ ipintel.svg
│       │   │   └─ ... (47 more)
│       │   ├─ images/
│       │   │   ├─ hero-bg.jpg
│       │   │   └─ features.png
│       │   └─ favicon.ico
│       │
│       ├─ package.json
│       ├─ next.config.js                     # Next.js 14 config
│       ├─ tailwind.config.js                 # TailwindCSS config
│       ├─ tsconfig.json
│       ├─ .env.local.example
│       ├─ Dockerfile
│       └─ README.md
│
├─ infrastructure/
│   ├─ nginx/
│   │   ├─ nginx.conf                         # Main Nginx config
│   │   ├─ sites-available/
│   │   │   ├─ maula.ai.conf                  # Main site config
│   │   │   ├─ auth.maula.ai.conf             # Auth service config
│   │   │   └─ api.maula.ai.conf              # API gateway config
│   │   └─ ssl/
│   │       ├─ README.md                      # SSL certificate instructions
│   │       └─ certbot-setup.sh               # Let's Encrypt setup script
│   │
│   ├─ cloudflare/
│   │   ├─ dns-records.json                   # DNS records configuration
│   │   └─ cloudflare-setup.md                # Cloudflare setup guide
│   │
│   └─ mongodb/
│       ├─ atlas-setup.md                     # MongoDB Atlas setup guide
│       └─ initial-setup.js                   # Initial database setup script
│
├─ scripts/
│   ├─ setup-dev-env.sh                       # Setup development environment
│   └─ health-check.sh                        # Check all services health
│
├─ .env.example                               # Root environment variables
├─ docker-compose.phase1.yml                  # Docker Compose for Phase 1
└─ README.md                                  # Root README
```

---

## 📝 STEP-BY-STEP IMPLEMENTATION

### Step 1: Setup Project Structure

```bash
# Create all folders
mkdir -p backend/shared-services/{auth-service,api-gateway}/src/{controllers,models,routes,services,middleware,utils,config,tests}
mkdir -p frontend/main-dashboard/{app,components,lib,styles,public}
mkdir -p infrastructure/{nginx,cloudflare,mongodb}
mkdir -p scripts

cd VictoryKit
```

---

### Step 2: Build Auth Service

#### 2.1 Initialize Auth Service

```bash
cd backend/shared-services/auth-service
npm init -y

# Install dependencies
npm install express mongoose bcryptjs jsonwebtoken passport passport-google-oauth20 passport-github2 cors redis express-rate-limit winston dotenv

# Install dev dependencies
npm install -D typescript @types/express @types/node @types/bcryptjs @types/jsonwebtoken @types/passport @types/cors ts-node nodemon jest @types/jest ts-jest eslint prettier

# Initialize TypeScript
npx tsc --init
```

#### 2.2 Create package.json scripts

```json
{
  "name": "auth-service",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  }
}
```

#### 2.3 Create User Model

**File:** `src/models/User.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
  avatar?: string;
  subscription: {
    plan: 'free' | 'basic' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    startDate?: Date;
    endDate?: Date;
  };
  apiKeys: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  oauth?: {
    provider: 'google' | 'github' | 'microsoft';
    providerId: string;
  };
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: function() { return !this.oauth; },
    select: false
  },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  emailVerified: { type: Boolean, default: false },
  avatar: String,
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active'
    },
    startDate: Date,
    endDate: Date
  },
  apiKeys: [{ type: Schema.Types.ObjectId, ref: 'ApiKey' }],
  oauth: {
    provider: {
      type: String,
      enum: ['google', 'github', 'microsoft']
    },
    providerId: String
  },
  lastLogin: Date
}, { timestamps: true });

UserSchema.index({ email: 1 });
UserSchema.index({ 'subscription.status': 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
```

#### 2.4 Create JWT Service

**File:** `src/services/jwtService.ts`

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '1h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export const jwtService = {
  generateAccessToken(userId: string): string {
    return jwt.sign({ userId, type: 'access' }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });
  },

  generateRefreshToken(userId: string): string {
    return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN
    });
  },

  verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  },

  verifyRefreshToken(token: string): any {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if ((decoded as any).type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  },

  generateEmailVerificationToken(userId: string): string {
    return jwt.sign({ userId, type: 'email_verification' }, JWT_SECRET, {
      expiresIn: '24h'
    });
  }
};
```

#### 2.5 Create Auth Controller

**File:** `src/controllers/authController.ts` (See [10-BACKEND-DETAILED-IMPLEMENTATION.md](./10-BACKEND-DETAILED-IMPLEMENTATION.md) Lines 80-200 for complete code)

#### 2.6 Create Database Config

**File:** `src/config/database.ts`

```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maula_auth_db';

export const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};
```

#### 2.7 Create Server

**File:** `src/server.ts`

```typescript
import express from 'express';
import cors from 'cors';
import { connectDatabase } from './config/database';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://maula.ai',
    /\.maula\.ai$/ // All subdomains
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'auth-service' });
});

// Start server
connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Auth Service running on port ${PORT}`);
  });
});

export default app;
```

#### 2.8 Create Dockerfile

**File:** `Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

#### 2.9 Create Environment Variables

**File:** `.env.example`

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/maula_auth_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Redis
REDIS_URL=redis://localhost:6379

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
```

#### 2.10 Test Auth Service

```bash
# Start service
npm run dev

# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Test health
curl http://localhost:5000/health
```

---

### Step 3: Build API Gateway

```bash
cd backend/shared-services/api-gateway
npm init -y
npm install express http-proxy-middleware redis express-rate-limit cors winston dotenv
npm install -D typescript @types/express ts-node nodemon
```

**File:** `src/server.ts`

```typescript
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'api-gateway' });
});

// Proxy to auth service
app.use('/api/auth', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true
}));

// Proxy to tools (will add in Phase 2)
// app.use('/api/fraudguard', createProxyMiddleware({ target: 'http://localhost:4001' }));

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
});
```

---

### Step 4: Build Main Landing Site

```bash
cd frontend
npx create-next-app@latest main-dashboard --typescript --tailwind --app
cd main-dashboard
npm install lucide-react axios swr
```

**File:** `app/page.tsx` (Homepage with 50 tool cards)

```typescript
import ToolCard from '@/components/ToolCard';

const tools = [
  { id: 1, name: 'FraudGuard', description: 'AI-powered fraud detection', category: 'Fraud Detection', logo: '/logos/fraudguard.svg', subdomain: 'fguard.maula.ai' },
  { id: 2, name: 'SmartScore', description: 'Risk scoring engine', category: 'Fraud Detection', logo: '/logos/smartscore.svg', subdomain: 'sscore.maula.ai' },
  { id: 11, name: 'IPIntel', description: 'IP intelligence analysis', category: 'IP & Network', logo: '/logos/ipintel.svg', subdomain: 'ipintel.maula.ai' },
  // ... (add all 50 tools)
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="border-b border-purple-500/30 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white">MAULA.AI</h1>
        </div>
      </nav>
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">
            AI-Powered Security Services
          </h2>
          <p className="text-xl text-purple-200">
            50+ AI-powered tools to protect your business
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </main>
  );
}
```

**File:** `components/ToolCard.tsx`

```typescript
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Tool {
  id: number;
  name: string;
  description: string;
  category: string;
  logo: string;
  subdomain: string;
}

export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link href={`/tools/${tool.id}`}>
      <div className="group relative overflow-hidden rounded-xl border border-purple-500/30 bg-slate-800/50 backdrop-blur p-6 transition-all hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2">
            <img src={tool.logo} alt={tool.name} className="w-full h-full" />
          </div>
          <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">{tool.name}</h3>
        <p className="text-sm text-purple-200 mb-4">{tool.description}</p>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-purple-400">{tool.category}</span>
          <span className="text-purple-300">{tool.subdomain}</span>
        </div>
      </div>
    </Link>
  );
}
```

---

### Step 5: MongoDB Atlas Setup

1. **Create Account:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free account
   - Create new project: "MAULA"

2. **Create Cluster:**
   - Click "Build a Database"
   - Choose "M10" (recommended for production)
   - Select AWS, region closest to your EC2
   - Cluster name: "maula-cluster"

3. **Create Database:**
   - Database name: `maula_auth_db`
   - Collections will be created automatically by Mongoose

4. **Security:**
   - Database Access → Add user: `maula_admin` with strong password
   - Network Access → Add IP: Your AWS EC2 IP (or 0.0.0.0/0 for development)

5. **Get Connection String:**
   ```
   mongodb+srv://maula_admin:<password>@maula-cluster.xxxxx.mongodb.net/maula_auth_db?retryWrites=true&w=majority
   ```
   - Add to auth-service `.env` file

6. **Test Connection:**
   ```bash
   mongosh "mongodb+srv://maula_admin:<password>@maula-cluster.xxxxx.mongodb.net/maula_auth_db"
   ```

---

### Step 6: Nginx Configuration

**File:** `infrastructure/nginx/sites-available/maula.ai.conf`

```nginx
# Main site - maula.ai
server {
    listen 80;
    server_name maula.ai www.maula.ai;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name maula.ai www.maula.ai;
    
    ssl_certificate /etc/letsencrypt/live/maula.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/maula.ai/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Auth service - auth.maula.ai
server {
    listen 443 ssl http2;
    server_name auth.maula.ai;
    
    ssl_certificate /etc/letsencrypt/live/maula.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/maula.ai/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# API Gateway - api.maula.ai
server {
    listen 443 ssl http2;
    server_name api.maula.ai;
    
    ssl_certificate /etc/letsencrypt/live/maula.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/maula.ai/privkey.pem;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Install and Configure:**

```bash
# Install Nginx
sudo apt update
sudo apt install nginx

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx

# Copy config
sudo cp infrastructure/nginx/sites-available/maula.ai.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/maula.ai.conf /etc/nginx/sites-enabled/

# Get SSL certificate
sudo certbot --nginx -d maula.ai -d www.maula.ai -d auth.maula.ai -d api.maula.ai

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

### Step 7: Cloudflare DNS Setup

1. **Add Domain:**
   - Login to Cloudflare
   - Add site: maula.ai
   - Update nameservers at your domain registrar

2. **Create DNS Records:**
   ```
   A     @            <AWS-EC2-IP>    Proxied (orange cloud)
   A     www          <AWS-EC2-IP>    Proxied
   CNAME *            maula.ai        Proxied (wildcard for all 50 subdomains)
   ```

3. **SSL/TLS Settings:**
   - SSL/TLS → Overview → Full (strict)
   - Edge Certificates → Always Use HTTPS: ON
   - Minimum TLS Version: 1.2

4. **Security:**
   - Firewall → Create rule to block bad bots
   - DDoS Protection: Enabled by default

5. **Performance:**
   - Speed → Optimization → Auto Minify: HTML, CSS, JS
   - Caching → Configuration → Browser Cache TTL: 4 hours

---

### Step 8: Docker Compose for Phase 1

**File:** `docker-compose.phase1.yml`

```yaml
version: '3.8'

services:
  auth-service:
    build: ./backend/shared-services/auth-service
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    restart: always
    
  api-gateway:
    build: ./backend/shared-services/api-gateway
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    restart: always
    
  main-dashboard:
    build: ./frontend/main-dashboard
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://api.maula.ai
    restart: always
    
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: always

volumes:
  redis-data:
```

**Usage:**

```bash
# Build and start all services
docker-compose -f docker-compose.phase1.yml up -d

# View logs
docker-compose -f docker-compose.phase1.yml logs -f

# Stop all services
docker-compose -f docker-compose.phase1.yml down
```

---

## ✅ TESTING PHASE 1

### Test 1: Auth Service

```bash
# Health check
curl https://auth.maula.ai/health

# Register user
curl -X POST https://auth.maula.ai/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST https://auth.maula.ai/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
# Should return: { "success": true, "data": { "user": {...}, "tokens": {...} } }
```

### Test 2: API Gateway

```bash
curl https://api.maula.ai/health
# Should return: { "status": "healthy", "service": "api-gateway" }
```

### Test 3: Main Landing Site

```bash
# Check if site loads
curl -I https://maula.ai
# Should return: HTTP/2 200

# Visit in browser
open https://maula.ai
# Should see homepage with 50 tool cards
```

### Test 4: SSL Certificates

```bash
# Check SSL
openssl s_client -connect maula.ai:443 -servername maula.ai

# Check all subdomains
curl -I https://auth.maula.ai
curl -I https://api.maula.ai
```

### Test 5: MongoDB Connection

```bash
# From auth-service container
docker exec -it <auth-service-container-id> sh
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(console.error)"
```

---

## 🎯 PHASE 1 COMPLETION CHECKLIST

- [ ] Auth Service running on port 5000
- [ ] API Gateway running on port 4000
- [ ] Main Dashboard running on port 3000
- [ ] MongoDB Atlas cluster created
- [ ] Database `maula_auth_db` accessible
- [ ] Redis running on port 6379
- [ ] Nginx configured for 3 domains (maula.ai, auth.maula.ai, api.maula.ai)
- [ ] SSL certificates installed (Let's Encrypt)
- [ ] Cloudflare DNS configured with wildcard subdomain
- [ ] All services accessible via HTTPS
- [ ] User registration working
- [ ] User login working
- [ ] JWT tokens being generated
- [ ] Health checks passing for all services
- [ ] Docker Compose setup complete
- [ ] All services restart automatically on failure

---

## 🚀 NEXT: PHASE 2

Once Phase 1 is complete and all tests pass, proceed to:
**[PHASE-2-FIRST-TOOL.md](./PHASE-2-FIRST-TOOL.md)** - Build complete FraudGuard tool

---

**Phase 1 Status:** ⏳ Ready to Build  
**Estimated Time:** 1-2 weeks  
**Prerequisites:** AWS EC2 instance, MongoDB Atlas account, Cloudflare account, Domain name