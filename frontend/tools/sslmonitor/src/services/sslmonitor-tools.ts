export const sslMonitorTools = [
  {
    name: "scan_certificate",
    description: "Scan SSL certificate for a domain",
    parameters: {
      type: "object",
      properties: { domain: { type: "string" } },
      required: ["domain"],
    },
  },
  {
    name: "check_expiry",
    description: "Check certificate expiration dates",
    parameters: {
      type: "object",
      properties: { daysThreshold: { type: "number" } },
    },
  },
  {
    name: "analyze_grade",
    description: "Analyze SSL security grade",
    parameters: {
      type: "object",
      properties: { domain: { type: "string" } },
      required: ["domain"],
    },
  },
  {
    name: "get_certificate_chain",
    description: "Get certificate chain info",
    parameters: {
      type: "object",
      properties: { domain: { type: "string" } },
      required: ["domain"],
    },
  },
];
