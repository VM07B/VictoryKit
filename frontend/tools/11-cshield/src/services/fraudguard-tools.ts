/**
 * IncidentResponse AI Function Tools
 * These functions are registered with the AI assistant to enable
 * natural language interaction with the IncidentResponse system.
 */

import { incidentResponseAPI } from './incidentResponseAPI';
import { Incident, Responder, Indicator, TimelineEvent, PlaybookRun } from '../types';

// Tool execution result type
interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  display?: {
    type: 'text' | 'table' | 'chart' | 'card' | 'form';
    content: any;
  };
}

// Tool function type
type ToolFunction = (params: Record<string, any>) => Promise<ToolResult>;

// Tool definitions for AI registration
export const INCIDENTRESPONSE_TOOLS = {
  triage_incident: {
    name: 'triage_incident',
    description: 'Triage a new security incident. Classify severity, priority, and initial response actions.',
    parameters: {
      type: 'object',
      properties: {
        incident_id: { type: 'string', description: 'Unique incident identifier' },
        title: { type: 'string', description: 'Incident title/description' },
        category: { type: 'string', description: 'Incident category (phishing, malware, breach, etc.)' },
        severity: { type: 'string', description: 'Initial severity assessment (low, medium, high, critical)' },
        affected_systems: { type: 'array', items: { type: 'string' }, description: 'Systems affected' },
        indicators: { type: 'array', items: { type: 'object' }, description: 'Initial indicators of compromise' },
      },
      required: ['incident_id', 'title'],
    },
  },
  analyze_indicator: {
    name: 'analyze_indicator',
    description: 'Analyze a security indicator (IP, domain, hash) for threat intelligence',
    parameters: {
      type: 'object',
      properties: {
        indicator_type: { type: 'string', description: 'Type of indicator (ip, domain, hash, email)' },
        value: { type: 'string', description: 'The indicator value to analyze' },
        context: { type: 'string', description: 'Context about where this indicator was found' },
      },
      required: ['indicator_type', 'value'],
    },
  },
  create_timeline_event: {
    name: 'create_timeline_event',
    description: 'Add a new event to the incident timeline',
    parameters: {
      type: 'object',
      properties: {
        incident_id: { type: 'string', description: 'Incident ID' },
        event_type: { type: 'string', description: 'Type of event (detection, analysis, containment, etc.)' },
        description: { type: 'string', description: 'Event description' },
        timestamp: { type: 'string', description: 'Event timestamp (ISO format)' },
        artifacts: { type: 'array', items: { type: 'string' }, description: 'Related artifacts/files' },
      },
      required: ['incident_id', 'event_type', 'description'],
    },
  },
  assign_responder: {
    name: 'assign_responder',
    description: 'Assign a responder to an incident',
    parameters: {
      type: 'object',
      properties: {
        incident_id: { type: 'string', description: 'Incident ID' },
        responder_id: { type: 'string', description: 'Responder ID' },
        role: { type: 'string', description: 'Role in response (lead, analyst, forensics, etc.)' },
      },
      required: ['incident_id', 'responder_id'],
    },
  },
  run_playbook: {
    name: 'run_playbook',
    description: 'Execute a response playbook for an incident type',
    parameters: {
      type: 'object',
      properties: {
        incident_id: { type: 'string', description: 'Incident ID' },
        playbook_type: { type: 'string', description: 'Type of playbook (phishing, ransomware, breach, etc.)' },
        parameters: { type: 'object', description: 'Playbook execution parameters' },
      },
      required: ['incident_id', 'playbook_type'],
    },
  },
  generate_report: {
    name: 'generate_report',
    description: 'Generate an incident report with findings and actions taken',
    parameters: {
      type: 'object',
      properties: {
        incident_id: { type: 'string', description: 'Incident ID' },
        report_type: { type: 'string', description: 'Type of report (executive, technical, forensic)' },
        include_timeline: { type: 'boolean', description: 'Include incident timeline' },
        include_indicators: { type: 'boolean', description: 'Include indicators of compromise' },
      },
      required: ['incident_id'],
    },
  },
};

// Tool implementations
export const toolImplementations: Record<string, ToolFunction> = {
  triage_incident: async (params) => {
    try {
      const result = await incidentResponseAPI.triageIncident(params);
      return {
        success: true,
        data: result,
        display: {
          type: 'card',
          content: {
            title: 'Incident Triaged',
            severity: result.severity,
            priority: result.priority,
            actions: result.recommended_actions,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Triage failed',
      };
    }
  },

  analyze_indicator: async (params) => {
    try {
      const result = await incidentResponseAPI.analyzeIndicator(params);
      return {
        success: true,
        data: result,
        display: {
          type: 'table',
          content: {
            headers: ['Indicator', 'Type', 'Risk Level', 'Description'],
            rows: [[params.value, params.indicator_type, result.risk_level, result.description]],
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
      };
    }
  },

  create_timeline_event: async (params) => {
    try {
      const result = await incidentResponseAPI.createTimelineEvent(params);
      return {
        success: true,
        data: result,
        display: {
          type: 'text',
          content: `Timeline event added: ${result.description}`,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Event creation failed',
      };
    }
  },

  assign_responder: async (params) => {
    try {
      const result = await incidentResponseAPI.assignResponder(params);
      return {
        success: true,
        data: result,
        display: {
          type: 'text',
          content: `Responder ${params.responder_id} assigned to incident ${params.incident_id}`,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Assignment failed',
      };
    }
  },

  run_playbook: async (params) => {
    try {
      const result = await incidentResponseAPI.runPlaybook(params);
      return {
        success: true,
        data: result,
        display: {
          type: 'card',
          content: {
            title: 'Playbook Executed',
            status: result.status,
            steps_completed: result.steps_completed,
            next_actions: result.next_actions,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Playbook execution failed',
      };
    }
  },

  generate_report: async (params) => {
    try {
      const result = await incidentResponseAPI.generateReport(params);
      return {
        success: true,
        data: result,
        display: {
          type: 'text',
          content: `Report generated: ${result.report_url}`,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Report generation failed',
      };
    }
  },
};
        transaction_id: { type: 'string', description: 'The transaction ID to look up' },
      },
      required: ['transaction_id'],
    },
  },
  open_risk_visualization: {
    name: 'open_risk_visualization',
    description: 'Open the risk visualization dashboard with specified chart type',
    parameters: {
      type: 'object',
      properties: {
        chart_type: {
          type: 'string',
          enum: ['risk_breakdown', 'timeline', 'distribution', 'comparison', 'heatmap'],
          description: 'Type of chart to display',
        },
        time_period: {
          type: 'string',
          enum: ['hour', 'day', 'week', 'month'],
          description: 'Time period for the visualization',
        },
      },
      required: ['chart_type'],
    },
  },
  get_transaction_history: {
    name: 'get_transaction_history',
    description: 'Get transaction history with optional filters',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Maximum number of transactions to return' },
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
  create_alert: {
    name: 'create_alert',
    description: 'Create a new fraud alert rule',
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
          description: 'Score threshold to trigger alert (0-100)',
        },
        notification_channels: {
          type: 'array',
          items: { type: 'string', enum: ['email', 'webhook', 'sms', 'slack'] },
          description: 'Channels to send notifications to',
        },
      },
      required: ['alert_type', 'threshold'],
    },
  },
  export_report: {
    name: 'export_report',
    description: 'Export a fraud analysis report in PDF or CSV format',
    parameters: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          enum: ['pdf', 'csv'],
          description: 'Export format',
        },
        start_date: { type: 'string', description: 'Report start date' },
        end_date: { type: 'string', description: 'Report end date' },
        include_details: { type: 'boolean', description: 'Include transaction details' },
      },
      required: ['format'],
    },
  },
};

// Tool implementations
const toolImplementations: Record<string, ToolFunction> = {
  async analyze_transaction(params): Promise<ToolResult> {
    try {
      const transaction: Transaction = {
        transaction_id: params.transaction_id || `TXN_${Date.now()}`,
        amount: params.amount,
        currency: params.currency || 'USD',
        timestamp: new Date().toISOString(),
        user: {
          email: params.user_email || 'unknown@email.com',
          ip_address: params.user_ip || '0.0.0.0',
        },
        device: {
          fingerprint: params.device_fingerprint || 'unknown',
          browser: params.browser || 'unknown',
          os: params.os || 'unknown',
        },
        payment: {
          card_last_four: params.card_last_four || '0000',
          card_type: params.card_type || 'unknown',
          bank_name: params.bank_name || 'unknown',
        },
        location: {
          country: params.location_country || 'unknown',
          city: params.location_city || 'unknown',
          lat: params.lat || 0,
          lng: params.lng || 0,
        },
        merchant: {
          name: params.merchant_name || 'unknown',
          category: params.merchant_category || 'unknown',
          mcc: params.mcc || '0000',
        },
      };

      const fraudScore = await fraudguardAPI.transactions.analyze(transaction);

      return {
        success: true,
        data: fraudScore,
        display: {
          type: 'card',
          content: {
            title: 'Transaction Analysis Complete',
            score: fraudScore.score,
            risk_level: fraudScore.risk_level,
            indicators: fraudScore.indicators,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze transaction',
      };
    }
  },

  async get_fraud_score(params): Promise<ToolResult> {
    try {
      const score = await fraudguardAPI.fraudScores.getScore(params.transaction_id);
      return {
        success: true,
        data: score,
        display: {
          type: 'card',
          content: {
            title: `Fraud Score for ${params.transaction_id}`,
            score: score.score,
            risk_level: score.risk_level,
            confidence: score.confidence,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get fraud score',
      };
    }
  },

  async open_risk_visualization(params): Promise<ToolResult> {
    // This tool triggers a UI action rather than an API call
    return {
      success: true,
      data: {
        action: 'open_visualization',
        chart_type: params.chart_type,
        time_period: params.time_period || 'day',
      },
      display: {
        type: 'chart',
        content: {
          chart_type: params.chart_type,
          time_period: params.time_period || 'day',
        },
      },
    };
  },

  async get_transaction_history(params): Promise<ToolResult> {
    try {
      const result = await fraudguardAPI.transactions.getAll({
        limit: params.limit,
        risk_level: params.risk_level,
        start_date: params.start_date,
        end_date: params.end_date,
      });

      return {
        success: true,
        data: result,
        display: {
          type: 'table',
          content: {
            headers: ['Transaction ID', 'Amount', 'Risk Level', 'Date'],
            rows: result.transactions.map((t) => [
              t.transaction_id,
              `${t.currency} ${t.amount}`,
              'Unknown', // Risk level would come from fraud scores
              new Date(t.timestamp).toLocaleDateString(),
            ]),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get transaction history',
      };
    }
  },

  async create_alert(params): Promise<ToolResult> {
    try {
      const alert = await fraudguardAPI.alerts.create({
        alert_type: params.alert_type,
        threshold: params.threshold,
        notification_channels: params.notification_channels || ['email'],
        active: true,
      });

      return {
        success: true,
        data: alert,
        display: {
          type: 'card',
          content: {
            title: 'Alert Created',
            alert_type: alert.alert_type,
            threshold: alert.threshold,
            channels: alert.notification_channels.join(', '),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create alert',
      };
    }
  },

  async export_report(params): Promise<ToolResult> {
    try {
      const options = {
        start_date: params.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: params.end_date || new Date().toISOString(),
        risk_levels: ['low', 'medium', 'high', 'critical'],
        include_details: params.include_details !== false,
        title: 'FraudGuard Analysis Report',
      };

      let blob: Blob;
      let filename: string;

      if (params.format === 'pdf') {
        blob = await fraudguardAPI.reports.exportPDF(options);
        filename = `fraudguard-report-${Date.now()}.pdf`;
      } else {
        blob = await fraudguardAPI.reports.exportCSV(options);
        filename = `fraudguard-report-${Date.now()}.csv`;
      }

      fraudguardAPI.reports.downloadBlob(blob, filename);

      return {
        success: true,
        data: { filename, format: params.format },
        display: {
          type: 'text',
          content: `Report exported successfully: ${filename}`,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export report',
      };
    }
  },
};

// Execute a tool by name
export async function executeTool(toolName: string, params: Record<string, any>): Promise<ToolResult> {
  const implementation = toolImplementations[toolName];
  
  if (!implementation) {
    return {
      success: false,
      error: `Unknown tool: ${toolName}`,
    };
  }

  return implementation(params);
}

// Get all tool definitions for AI registration
export function getToolDefinitions() {
  return Object.values(FRAUDGUARD_TOOLS);
}

// Validate tool parameters
export function validateToolParams(toolName: string, params: Record<string, any>): {
  valid: boolean;
  errors: string[];
} {
  const tool = FRAUDGUARD_TOOLS[toolName as keyof typeof FRAUDGUARD_TOOLS];
  
  if (!tool) {
    return { valid: false, errors: [`Unknown tool: ${toolName}`] };
  }

  const errors: string[] = [];
  const required = tool.parameters.required || [];
  
  for (const param of required) {
    if (!(param in params) || params[param] === undefined || params[param] === null) {
      errors.push(`Missing required parameter: ${param}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default {
  FRAUDGUARD_TOOLS,
  executeTool,
  getToolDefinitions,
  validateToolParams,
};
