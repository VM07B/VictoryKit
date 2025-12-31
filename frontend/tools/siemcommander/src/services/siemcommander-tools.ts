export const siemCommanderTools = [
  {
    name: "search_logs",
    description: "Search security logs",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" },
        timeRange: { type: "string" },
        sources: { type: "array", items: { type: "string" } },
      },
      required: ["query"],
    },
  },
  {
    name: "create_correlation_rule",
    description: "Create event correlation rule",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string" },
        conditions: { type: "array" },
        action: { type: "string" },
      },
      required: ["name", "conditions"],
    },
  },
  {
    name: "manage_alert",
    description: "Manage security alert",
    parameters: {
      type: "object",
      properties: {
        alertId: { type: "string" },
        action: {
          type: "string",
          enum: ["acknowledge", "investigate", "resolve", "escalate"],
        },
      },
      required: ["alertId", "action"],
    },
  },
  {
    name: "generate_query",
    description: "Generate log query",
    parameters: {
      type: "object",
      properties: {
        description: { type: "string" },
        format: { type: "string", enum: ["kql", "spl", "lucene"] },
      },
      required: ["description"],
    },
  },
];
