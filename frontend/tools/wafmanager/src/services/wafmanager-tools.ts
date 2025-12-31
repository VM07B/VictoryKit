// WAFManager AI Tools for function calling

export const wafManagerTools = [
  {
    name: "get_waf_rules",
    description: "Retrieve WAF rules with optional filters",
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: [
            "sqli",
            "xss",
            "rce",
            "lfi",
            "rfi",
            "csrf",
            "custom",
            "bot",
            "scanner",
          ],
          description: "Filter by attack category",
        },
        enabled: {
          type: "boolean",
          description: "Filter by enabled status",
        },
        severity: {
          type: "string",
          enum: ["critical", "high", "medium", "low", "info"],
          description: "Filter by severity level",
        },
      },
    },
  },
  {
    name: "create_waf_rule",
    description: "Create a new WAF rule",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Rule name" },
        pattern: { type: "string", description: "Detection pattern (regex)" },
        patternType: {
          type: "string",
          enum: ["regex", "exact", "contains", "starts_with", "ends_with"],
          description: "Pattern matching type",
        },
        target: {
          type: "string",
          enum: [
            "uri",
            "headers",
            "body",
            "query",
            "ip",
            "user_agent",
            "cookie",
          ],
          description: "Target field to inspect",
        },
        ruleType: {
          type: "string",
          enum: ["block", "allow", "challenge", "rate_limit", "log"],
          description: "Action to take on match",
        },
        category: { type: "string", description: "Attack category" },
        severity: { type: "string", description: "Severity level" },
      },
      required: ["name", "pattern", "target", "ruleType"],
    },
  },
  {
    name: "analyze_attack",
    description: "Analyze a potential attack request",
    parameters: {
      type: "object",
      properties: {
        uri: { type: "string", description: "Request URI" },
        method: { type: "string", description: "HTTP method" },
        headers: { type: "object", description: "Request headers" },
        body: { type: "string", description: "Request body" },
        ip: { type: "string", description: "Source IP address" },
      },
      required: ["uri"],
    },
  },
  {
    name: "get_attack_logs",
    description: "Retrieve recent attack logs",
    parameters: {
      type: "object",
      properties: {
        category: { type: "string", description: "Filter by category" },
        severity: { type: "string", description: "Filter by severity" },
        sourceIp: { type: "string", description: "Filter by source IP" },
        limit: { type: "number", description: "Number of logs to retrieve" },
      },
    },
  },
  {
    name: "get_traffic_stats",
    description: "Get traffic statistics and analytics",
    parameters: {
      type: "object",
      properties: {
        period: {
          type: "string",
          enum: ["minute", "hour", "day"],
          description: "Aggregation period",
        },
        hours: { type: "number", description: "Hours of data to retrieve" },
      },
    },
  },
  {
    name: "toggle_rule",
    description: "Enable or disable a WAF rule",
    parameters: {
      type: "object",
      properties: {
        ruleId: { type: "string", description: "Rule ID to toggle" },
      },
      required: ["ruleId"],
    },
  },
];

export type WAFToolName =
  | "get_waf_rules"
  | "create_waf_rule"
  | "analyze_attack"
  | "get_attack_logs"
  | "get_traffic_stats"
  | "toggle_rule";
