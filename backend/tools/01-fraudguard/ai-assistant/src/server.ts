import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './utils/logger.js';
import { LLMRouter } from './services/llmRouter.js';
import { FraudGuardFunctions } from './functions/fraudguardFunctions.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const PORT = process.env.PORT || 6001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Initialize services
const llmRouter = new LLMRouter();
const fraudFunctions = new FraudGuardFunctions();

// Track connected clients
const clients = new Map<string, WebSocket>();

// WebSocket connection handler
wss.on('connection', (ws: WebSocket) => {
  const clientId = uuidv4();
  clients.set(clientId, ws);
  
  logger.info(`Client connected: ${clientId}`);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    clientId,
    message: 'Connected to FraudGuard AI Assistant',
    timestamp: new Date().toISOString(),
  }));

  // Handle incoming messages
  ws.on('message', async (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      await handleMessage(ws, clientId, message);
    } catch (error) {
      logger.error(`Error handling message from ${clientId}:`, error);
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Failed to process message',
        timestamp: new Date().toISOString(),
      }));
    }
  });

  // Handle disconnection
  ws.on('close', () => {
    clients.delete(clientId);
    logger.info(`Client disconnected: ${clientId}`);
  });

  // Handle errors
  ws.on('error', (error) => {
    logger.error(`WebSocket error for ${clientId}:`, error);
    clients.delete(clientId);
  });
});

// Message handler
async function handleMessage(ws: WebSocket, clientId: string, message: any) {
  const { type, provider, content, conversationId, tools } = message;

  switch (type) {
    case 'chat':
      await handleChatMessage(ws, clientId, {
        provider: provider || 'gemini',
        content,
        conversationId: conversationId || uuidv4(),
        tools: tools !== false, // Enable tools by default
      });
      break;

    case 'function_call':
      await handleFunctionCall(ws, clientId, message);
      break;

    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      break;

    case 'switch_provider':
      ws.send(JSON.stringify({
        type: 'provider_switched',
        provider: message.provider,
        timestamp: new Date().toISOString(),
      }));
      break;

    default:
      ws.send(JSON.stringify({
        type: 'error',
        error: `Unknown message type: ${type}`,
        timestamp: new Date().toISOString(),
      }));
  }
}

// Chat message handler
async function handleChatMessage(
  ws: WebSocket,
  clientId: string,
  options: { provider: string; content: string; conversationId: string; tools: boolean }
) {
  const { provider, content, conversationId, tools } = options;

  // Send typing indicator
  ws.send(JSON.stringify({
    type: 'typing',
    conversationId,
    timestamp: new Date().toISOString(),
  }));

  try {
    // Get tool definitions if enabled
    const toolDefs = tools ? fraudFunctions.getToolDefinitions() : undefined;

    // Stream response from LLM
    const stream = await llmRouter.streamChat(provider, content, {
      conversationId,
      tools: toolDefs,
      systemPrompt: getSystemPrompt(),
    });

    let fullResponse = '';
    let functionCalls: any[] = [];

    for await (const chunk of stream) {
      if (chunk.type === 'text') {
        fullResponse += chunk.content;
        ws.send(JSON.stringify({
          type: 'chunk',
          content: chunk.content,
          conversationId,
          timestamp: new Date().toISOString(),
        }));
      } else if (chunk.type === 'function_call') {
        functionCalls.push(chunk.functionCall);
      }
    }

    // Handle function calls
    if (functionCalls.length > 0) {
      for (const call of functionCalls) {
        const result = await fraudFunctions.execute(call.name, call.arguments);
        ws.send(JSON.stringify({
          type: 'function_result',
          name: call.name,
          result,
          conversationId,
          timestamp: new Date().toISOString(),
        }));
      }
    }

    // Send completion
    ws.send(JSON.stringify({
      type: 'complete',
      content: fullResponse,
      conversationId,
      provider,
      timestamp: new Date().toISOString(),
    }));

  } catch (error) {
    logger.error(`Chat error for ${clientId}:`, error);
    ws.send(JSON.stringify({
      type: 'error',
      error: error instanceof Error ? error.message : 'Chat processing failed',
      conversationId,
      timestamp: new Date().toISOString(),
    }));
  }
}

// Function call handler
async function handleFunctionCall(ws: WebSocket, clientId: string, message: any) {
  const { name, arguments: args, conversationId } = message;

  try {
    const result = await fraudFunctions.execute(name, args);
    ws.send(JSON.stringify({
      type: 'function_result',
      name,
      result,
      conversationId,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'error',
      error: `Function execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      conversationId,
      timestamp: new Date().toISOString(),
    }));
  }
}

// System prompt for fraud detection assistant
function getSystemPrompt(): string {
  return `You are FraudGuard AI, an expert fraud detection assistant. Your role is to help users:

1. Analyze transactions for potential fraud
2. Explain fraud risk scores and indicators
3. Configure fraud detection alerts
4. Generate fraud analysis reports
5. Interpret patterns and anomalies

You have access to the following tools:
- analyze_transaction: Analyze a transaction for fraud risk
- get_fraud_score: Retrieve fraud score for a transaction
- open_risk_visualization: Display charts and graphs
- get_transaction_history: View past transactions
- create_alert: Set up fraud alerts
- export_report: Generate PDF/CSV reports

Be concise, accurate, and helpful. When discussing fraud indicators, explain them in terms that business users can understand. Always prioritize security and accuracy in your recommendations.`;
}

// REST endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'FraudGuard AI Assistant',
    version: '1.0.0',
    connectedClients: clients.size,
    providers: llmRouter.getAvailableProviders(),
  });
});

app.get('/providers', (req, res) => {
  res.json({
    providers: llmRouter.getAvailableProviders(),
    default: 'gemini',
  });
});

app.get('/functions', (req, res) => {
  res.json({
    functions: fraudFunctions.getToolDefinitions(),
  });
});

// Start server
server.listen(PORT, () => {
  logger.info(`FraudGuard AI Assistant running on port ${PORT}`);
  logger.info(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
  logger.info(`Available LLM providers: ${llmRouter.getAvailableProviders().join(', ')}`);
});

export default server;
