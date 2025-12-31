export const blueTeamAITools = [
  {
    name: "start_threat_hunt",
    description: "Start a new threat hunting operation",
    parameters: {
      type: "object",
      properties: {
        hypothesis: { type: "string" },
        priority: {
          type: "string",
          enum: ["low", "medium", "high", "critical"],
        },
      },
      required: ["hypothesis"],
    },
  },
  {
    name: "analyze_incident",
    description: "Analyze a security incident",
    parameters: {
      type: "object",
      properties: { incidentId: { type: "string" } },
      required: ["incidentId"],
    },
  },
  {
    name: "search_iocs",
    description: "Search for indicators of compromise",
    parameters: {
      type: "object",
      properties: {
        ioc: { type: "string" },
        type: { type: "string", enum: ["ip", "domain", "hash", "url"] },
      },
      required: ["ioc"],
    },
  },
  {
    name: "generate_detection",
    description: "Generate detection rule",
    parameters: {
      type: "object",
      properties: {
        technique: { type: "string" },
        format: { type: "string", enum: ["sigma", "yara", "snort"] },
      },
      required: ["technique"],
    },
  },
];
