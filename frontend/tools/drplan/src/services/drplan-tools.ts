export const drplanTools = [
  {
    name: "create_dr_plan",
    description: "Create a new disaster recovery plan",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Plan name",
        },
        description: {
          type: "string",
          description: "Plan description",
        },
        rto: {
          type: "number",
          description: "Recovery Time Objective in minutes",
        },
        rpo: {
          type: "number",
          description: "Recovery Point Objective in minutes",
        },
        systems: {
          type: "array",
          items: { type: "string" },
          description: "Critical systems covered",
        },
      },
      required: ["name", "rto", "rpo"],
    },
  },
  {
    name: "schedule_drill",
    description: "Schedule a disaster recovery drill",
    parameters: {
      type: "object",
      properties: {
        planId: {
          type: "string",
          description: "DR Plan ID",
        },
        type: {
          type: "string",
          enum: ["tabletop", "simulation", "full"],
          description: "Drill type",
        },
        date: {
          type: "string",
          description: "Scheduled date (ISO format)",
        },
        participants: {
          type: "array",
          items: { type: "string" },
          description: "Participant emails or names",
        },
      },
      required: ["planId", "type", "date"],
    },
  },
  {
    name: "assess_risk",
    description: "Assess disaster recovery risk",
    parameters: {
      type: "object",
      properties: {
        scenario: {
          type: "string",
          description: "Risk scenario description",
        },
        systemIds: {
          type: "array",
          items: { type: "string" },
          description: "Affected system IDs",
        },
      },
      required: ["scenario"],
    },
  },
  {
    name: "create_runbook",
    description: "Create a recovery runbook",
    parameters: {
      type: "object",
      properties: {
        systemId: {
          type: "string",
          description: "System ID",
        },
        name: {
          type: "string",
          description: "Runbook name",
        },
        automated: {
          type: "boolean",
          description: "Enable automation",
        },
      },
      required: ["systemId", "name"],
    },
  },
  {
    name: "map_dependencies",
    description: "Map system dependencies",
    parameters: {
      type: "object",
      properties: {
        systemId: {
          type: "string",
          description: "System ID to map",
        },
        includeUpstream: {
          type: "boolean",
          description: "Include upstream dependencies",
        },
        includeDownstream: {
          type: "boolean",
          description: "Include downstream dependencies",
        },
      },
      required: ["systemId"],
    },
  },
  {
    name: "generate_report",
    description: "Generate DR readiness report",
    parameters: {
      type: "object",
      properties: {
        reportType: {
          type: "string",
          enum: ["readiness", "drill-results", "compliance", "gap-analysis"],
          description: "Report type",
        },
        planId: {
          type: "string",
          description: "Specific plan ID (optional)",
        },
      },
      required: ["reportType"],
    },
  },
];

export default drplanTools;
