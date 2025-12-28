/**
 * FraudGuard AI Functions - Tool implementations for AI assistant
 */

import axios from 'axios';
import { logger } from '../utils/logger.js';

const FRAUDGUARD_API = process.env.FRAUDGUARD_API_URL || 'http://localhost:4001';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface FunctionResult {
  success: boolean;
  data?: any;
  error?: string;
  display?: {
    type: 'text' | 'table' | 'chart' | 'card';
    content: any;
  };
}

export class FraudGuardFunctions {
  private tools: Map<string, (args: Record<string, any>) => Promise<FunctionResult>>;

  constructor() {
    this.tools = new Map();
    this.registerTools();
    logger.info('FraudGuard functions initialized');
  }

  private registerTools() {
    this.tools.set('analyze_transaction', this.analyzeTransaction.bind(this));
    this.tools.set('get_fraud_score', this.getFraudScore.bind(this));
    this.tools.set('open_risk_visualization', this.openRiskVisualization.bind(this));
    this.tools.set('get_transaction_history', this.getTransactionHistory.bind(this));
    this.tools.set('create_alert', this.createAlert.bind(this));
    this.tools.set('export_report', this.exportReport.bind(this));
  }

  getToolDefinitions(): ToolDefinition[] {
    return [
      {
        name: 'analyze_transaction',
        description: 'Analyze a transaction for potential fraud. Returns a fraud score, risk level, and detailed indicators.',
        parameters: {
          type: 'object',
          properties: {
            transaction_id: { type: 'string', description: 'Unique transaction identifier' },
            amount: { type: 'number', description: 'Transaction amount in dollars' },
            currency: { type: 'string', description: 'Currency code (USD, EUR, etc.)', default: 'USD' },
            user_email: { type: 'string', description: 'User email address' },
            user_ip: { type: 'string', description: 'User IP address' },
            device_fingerprint: { type: 'string', description: 'Device fingerprint hash' },
            card_last_four: { type: 'string', description: 'Last 4 digits of card number' },
            country: { type: 'string', description: 'Transaction country code' },
            city: { type: 'string', description: 'Transaction city' },
            merchant_category: { type: 'string', description: 'Merchant category code' },
          },
          required: ['amount'],
        },
      },
      {
        name: 'get_fraud_score',
        description: 'Retrieve the fraud score and risk details for a specific transaction by its ID.',
        parameters: {
          type: 'object',
          properties: {
            transaction_id: { type: 'string', description: 'The transaction ID to look up' },
          },
          required: ['transaction_id'],
        },
      },
      {
        name: 'open_risk_visualization',
        description: 'Open a risk visualization chart in the dashboard.',
        parameters: {
          type: 'object',
          properties: {
            chart_type: {
              type: 'string',
              enum: ['risk_breakdown', 'timeline', 'distribution', 'comparison', 'heatmap'],
              description: 'Type of visualization to display',
            },
            time_period: {
              type: 'string',
              enum: ['hour', 'day', 'week', 'month'],
              description: 'Time period for the data',
            },
          },
          required: ['chart_type'],
        },
      },
      {
        name: 'get_transaction_history',
        description: 'Get a list of past transactions with optional filtering.',
        parameters: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Maximum number of transactions to return', default: 20 },
            risk_level: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              description: 'Filter by risk level',
            },
            start_date: { type: 'string', description: 'Start date (ISO format)' },
            end_date: { type: 'string', description: 'End date (ISO format)' },
          },
        },
      },
      {
        name: 'create_alert',
        description: 'Create a new fraud alert rule to be notified when certain conditions are met.',
        parameters: {
          type: 'object',
          properties: {
            alert_type: {
              type: 'string',
              enum: ['high_risk_transaction', 'suspicious_pattern', 'velocity_breach', 'unusual_location'],
              description: 'Type of alert to create',
            },
            threshold: {
              type: 'number',
              description: 'Score threshold (0-100) to trigger the alert',
              default: 70,
            },
            notification_channels: {
              type: 'array',
              items: { type: 'string', enum: ['email', 'webhook', 'sms', 'slack'] },
              description: 'Channels to send notifications to',
              default: ['email'],
            },
          },
          required: ['alert_type'],
        },
      },
      {
        name: 'export_report',
        description: 'Generate and download a fraud analysis report.',
        parameters: {
          type: 'object',
          properties: {
            format: {
              type: 'string',
              enum: ['pdf', 'csv'],
              description: 'Report format',
              default: 'pdf',
            },
            start_date: { type: 'string', description: 'Report start date' },
            end_date: { type: 'string', description: 'Report end date' },
            include_details: { type: 'boolean', description: 'Include transaction details', default: true },
            title: { type: 'string', description: 'Report title' },
          },
          required: ['format'],
        },
      },
    ];
  }

  async execute(name: string, args: Record<string, any>): Promise<FunctionResult> {
    const func = this.tools.get(name);
    if (!func) {
      return { success: false, error: `Unknown function: ${name}` };
    }

    try {
      return await func(args);
    } catch (error) {
      logger.error(`Function execution error (${name}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Function execution failed',
      };
    }
  }

  private async analyzeTransaction(args: Record<string, any>): Promise<FunctionResult> {
    const transaction = {
      transaction_id: args.transaction_id || `TXN_${Date.now()}`,
      amount: args.amount,
      currency: args.currency || 'USD',
      user: {
        email: args.user_email || 'unknown@email.com',
        ip_address: args.user_ip || '0.0.0.0',
      },
      device: {
        fingerprint: args.device_fingerprint || 'unknown',
      },
      payment: {
        card_last_four: args.card_last_four || '0000',
      },
      location: {
        country: args.country || 'unknown',
        city: args.city || 'unknown',
      },
      merchant: {
        category: args.merchant_category,
      },
    };

    const response = await axios.post(`${FRAUDGUARD_API}/transactions/analyze`, transaction);
    
    return {
      success: true,
      data: response.data,
      display: {
        type: 'card',
        content: {
          title: 'Transaction Analysis Complete',
          score: response.data.score,
          risk_level: response.data.risk_level,
          indicators: response.data.indicators,
          recommendation: response.data.recommendation,
        },
      },
    };
  }

  private async getFraudScore(args: Record<string, any>): Promise<FunctionResult> {
    const response = await axios.get(`${FRAUDGUARD_API}/fraud-scores/${args.transaction_id}`);
    
    return {
      success: true,
      data: response.data,
      display: {
        type: 'card',
        content: {
          title: `Fraud Score for ${args.transaction_id}`,
          score: response.data.score,
          risk_level: response.data.risk_level,
          confidence: response.data.confidence,
        },
      },
    };
  }

  private async openRiskVisualization(args: Record<string, any>): Promise<FunctionResult> {
    // This triggers a UI action rather than making an API call
    return {
      success: true,
      data: {
        action: 'open_visualization',
        chart_type: args.chart_type,
        time_period: args.time_period || 'day',
      },
      display: {
        type: 'chart',
        content: {
          type: args.chart_type,
          period: args.time_period,
        },
      },
    };
  }

  private async getTransactionHistory(args: Record<string, any>): Promise<FunctionResult> {
    const params = new URLSearchParams();
    if (args.limit) params.set('limit', args.limit.toString());
    if (args.risk_level) params.set('risk_level', args.risk_level);
    if (args.start_date) params.set('start_date', args.start_date);
    if (args.end_date) params.set('end_date', args.end_date);

    const response = await axios.get(`${FRAUDGUARD_API}/transactions?${params}`);
    
    return {
      success: true,
      data: response.data,
      display: {
        type: 'table',
        content: {
          headers: ['Transaction ID', 'Amount', 'Date', 'Status'],
          rows: response.data.transactions.map((t: any) => [
            t.transaction_id,
            `${t.currency} ${t.amount}`,
            new Date(t.timestamp).toLocaleDateString(),
            t.status,
          ]),
        },
      },
    };
  }

  private async createAlert(args: Record<string, any>): Promise<FunctionResult> {
    const alert = {
      alert_type: args.alert_type,
      threshold: args.threshold || 70,
      notification_channels: args.notification_channels || ['email'],
      active: true,
    };

    const response = await axios.post(`${FRAUDGUARD_API}/alerts`, alert);
    
    return {
      success: true,
      data: response.data,
      display: {
        type: 'card',
        content: {
          title: 'Alert Created Successfully',
          alert_type: response.data.alert_type,
          threshold: response.data.threshold,
          channels: response.data.notification_channels.join(', '),
        },
      },
    };
  }

  private async exportReport(args: Record<string, any>): Promise<FunctionResult> {
    const options = {
      start_date: args.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: args.end_date || new Date().toISOString(),
      risk_levels: ['low', 'medium', 'high', 'critical'],
      include_details: args.include_details !== false,
      title: args.title || 'FraudGuard Analysis Report',
    };

    // Trigger export (actual download would happen on frontend)
    return {
      success: true,
      data: {
        action: 'export_report',
        format: args.format,
        options,
      },
      display: {
        type: 'text',
        content: `Report export initiated. Format: ${args.format.toUpperCase()}`,
      },
    };
  }
}

export default FraudGuardFunctions;
