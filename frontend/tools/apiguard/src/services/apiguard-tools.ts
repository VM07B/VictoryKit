export const apiGuardTools = [
  {
    name: "get_api_endpoints",
    description: "Retrieve monitored API endpoints",
    parameters: {
      type: "object",
      properties: {
        method: { type: "string" },
        authRequired: { type: "boolean" },
      },
    },
  },
  {
    name: "configure_rate_limit",
    description: "Configure rate limiting for an endpoint",
    parameters: {
      type: "object",
      properties: {
        endpoint: { type: "string" },
        limit: { type: "number" },
        windowMs: { type: "number" },
        blockDuration: { type: "number" },
      },
      required: ["endpoint", "limit"],
    },
  },
  {
    name: "scan_api_endpoint",
    description: "Scan an API endpoint for vulnerabilities",
    parameters: {
      type: "object",
      properties: { url: { type: "string" } },
      required: ["url"],
    },
  },
  {
    name: "get_auth_events",
    description: "Get authentication events and anomalies",
    parameters: {
      type: "object",
      properties: { type: { type: "string" }, limit: { type: "number" } },
    },
  },
];
