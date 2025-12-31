/**
 * IncidentResponse AI Function Tools
 * These functions are registered with the AI assistant to enable
 * natural language interaction with the IncidentResponse system.
 */

import { incidentResponseAPI } from "./incidentResponseAPI";
import {
  Incident,
  Responder,
  Indicator,
  TimelineEvent,
  PlaybookRun,
} from "../types";

// Tool execution result type
interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  display?: {
    type: "text" | "table" | "chart" | "card" | "form";
    content: any;
  };
}

// Tool function type
type ToolFunction = (params: Record<string, any>) => Promise<ToolResult>;

// Tool definitions for AI registration
export const INCIDENTRESPONSE_TOOLS = {
  triage_incident: {
    name: "triage_incident",
    description:
      "Triage a new security incident. Classify severity, priority, and initial response actions.",
    parameters: {
      type: "object",
      properties: {
        incident_id: {
          type: "string",
          description: "Unique incident identifier",
        },
        title: { type: "string", description: "Incident title/description" },
        category: {
          type: "string",
          description: "Incident category (phishing, malware, breach, etc.)",
        },
        severity: {
          type: "string",
          description:
            "Initial severity assessment (low, medium, high, critical)",
        },
        affected_systems: {
          type: "array",
          items: { type: "string" },
          description: "Systems affected",
        },
        indicators: {
          type: "array",
          items: { type: "object" },
          description: "Initial indicators of compromise",
        },
      },
      required: ["incident_id", "title"],
    },
  },
  analyze_indicator: {
    name: "analyze_indicator",
    description:
      "Analyze a security indicator (IP, domain, hash) for threat intelligence",
    parameters: {
      type: "object",
      properties: {
        indicator_type: {
          type: "string",
          description: "Type of indicator (ip, domain, hash, email)",
        },
        value: {
          type: "string",
          description: "The indicator value to analyze",
        },
        context: {
          type: "string",
          description: "Context about where this indicator was found",
        },
      },
      required: ["indicator_type", "value"],
    },
  },
  create_timeline_event: {
    name: "create_timeline_event",
    description: "Add a new event to the incident timeline",
    parameters: {
      type: "object",
      properties: {
        incident_id: { type: "string", description: "Incident ID" },
        event_type: {
          type: "string",
          description: "Type of event (detection, analysis, containment, etc.)",
        },
        description: { type: "string", description: "Event description" },
        timestamp: {
          type: "string",
          description: "Event timestamp (ISO format)",
        },
        artifacts: {
          type: "array",
          items: { type: "string" },
          description: "Related artifacts/files",
        },
      },
      required: ["incident_id", "event_type", "description"],
    },
  },
  assign_responder: {
    name: "assign_responder",
    description: "Assign a responder to an incident",
    parameters: {
      type: "object",
      properties: {
        incident_id: { type: "string", description: "Incident ID" },
        responder_id: { type: "string", description: "Responder ID" },
        role: {
          type: "string",
          description: "Role in response (lead, analyst, forensics, etc.)",
        },
      },
      required: ["incident_id", "responder_id"],
    },
  },
  run_playbook: {
    name: "run_playbook",
    description: "Execute a response playbook for an incident type",
    parameters: {
      type: "object",
      properties: {
        incident_id: { type: "string", description: "Incident ID" },
        playbook_type: {
          type: "string",
          description: "Type of playbook (phishing, ransomware, breach, etc.)",
        },
        parameters: {
          type: "object",
          description: "Playbook execution parameters",
        },
      },
      required: ["incident_id", "playbook_type"],
    },
  },
  generate_report: {
    name: "generate_report",
    description: "Generate an incident report with findings and actions taken",
    parameters: {
      type: "object",
      properties: {
        incident_id: { type: "string", description: "Incident ID" },
        report_type: {
          type: "string",
          description: "Type of report (executive, technical, forensic)",
        },
        include_timeline: {
          type: "boolean",
          description: "Include incident timeline",
        },
        include_indicators: {
          type: "boolean",
          description: "Include indicators of compromise",
        },
      },
      required: ["incident_id"],
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
          type: "card",
          content: {
            title: "Incident Triaged",
            severity: result.severity,
            priority: result.priority,
            actions: result.recommended_actions,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Triage failed",
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
          type: "table",
          content: {
            headers: ["Indicator", "Type", "Risk Level", "Description"],
            rows: [
              [
                params.value,
                params.indicator_type,
                result.risk_level,
                result.description,
              ],
            ],
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Analysis failed",
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
          type: "text",
          content: `Timeline event added: ${result.description}`,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Event creation failed",
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
          type: "text",
          content: `Responder ${params.responder_id} assigned to incident ${params.incident_id}`,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Assignment failed",
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
          type: "card",
          content: {
            title: "Playbook Executed",
            status: result.status,
            steps_completed: result.steps_completed,
            next_actions: result.next_actions,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Playbook execution failed",
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
          type: "text",
          content: `Report generated: ${result.report_url}`,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Report generation failed",
      };
    }
  },
};

// Execute a tool by name
export async function executeTool(
  toolName: string,
  params: Record<string, any>
): Promise<ToolResult> {
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
  return Object.values(INCIDENTRESPONSE_TOOLS);
}

// Validate tool parameters
export function validateToolParams(
  toolName: string,
  params: Record<string, any>
): {
  valid: boolean;
  errors: string[];
} {
  const tool =
    INCIDENTRESPONSE_TOOLS[toolName as keyof typeof INCIDENTRESPONSE_TOOLS];

  if (!tool) {
    return { valid: false, errors: [`Unknown tool: ${toolName}`] };
  }

  const errors: string[] = [];
  const required = tool.parameters.required || [];

  for (const param of required) {
    if (
      !(param in params) ||
      params[param] === undefined ||
      params[param] === null
    ) {
      errors.push(`Missing required parameter: ${param}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default {
  INCIDENTRESPONSE_TOOLS,
  executeTool,
  getToolDefinitions,
  validateToolParams,
};
