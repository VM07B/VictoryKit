export const ddosShieldTools = [
  {
    name: "get_active_attacks",
    description: "Get currently active DDoS attacks",
    parameters: {
      type: "object",
      properties: {
        severity: {
          type: "string",
          enum: ["low", "medium", "high", "critical"],
        },
      },
    },
  },
  {
    name: "analyze_traffic",
    description: "Analyze traffic for anomalies",
    parameters: {
      type: "object",
      properties: {
        timeRange: { type: "string" },
        threshold: { type: "number" },
      },
    },
  },
  {
    name: "mitigate_attack",
    description: "Initiate attack mitigation",
    parameters: {
      type: "object",
      properties: {
        attackId: { type: "string" },
        action: { type: "string", enum: ["rate_limit", "block", "scrub"] },
      },
      required: ["attackId", "action"],
    },
  },
  {
    name: "configure_rule",
    description: "Configure mitigation rule",
    parameters: {
      type: "object",
      properties: {
        type: { type: "string" },
        threshold: { type: "number" },
        action: { type: "string" },
      },
    },
  },
];
