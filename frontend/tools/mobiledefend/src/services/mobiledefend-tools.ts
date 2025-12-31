export const mobiledefendTools = [
  {
    name: "analyze_app",
    description: "Analyze mobile application for security issues",
    parameters: {
      type: "object",
      properties: {
        appId: {
          type: "string",
          description: "App ID or package name",
        },
        analysisType: {
          type: "string",
          enum: ["quick", "full", "permissions", "network"],
          description: "Type of analysis",
        },
      },
      required: ["appId"],
    },
  },
  {
    name: "scan_device",
    description: "Scan mobile device for security issues",
    parameters: {
      type: "object",
      properties: {
        deviceId: {
          type: "string",
          description: "Device ID",
        },
        scanType: {
          type: "string",
          enum: ["posture", "compliance", "malware", "full"],
          description: "Type of scan",
        },
      },
      required: ["deviceId"],
    },
  },
  {
    name: "check_permissions",
    description: "Audit app permissions for privacy risks",
    parameters: {
      type: "object",
      properties: {
        appId: {
          type: "string",
          description: "App ID to check",
        },
        strictMode: {
          type: "boolean",
          description: "Use strict permission checking",
        },
      },
      required: ["appId"],
    },
  },
  {
    name: "detect_malware",
    description: "Scan for mobile malware",
    parameters: {
      type: "object",
      properties: {
        target: {
          type: "string",
          enum: ["app", "device", "all"],
          description: "Scan target",
        },
        targetId: {
          type: "string",
          description: "App or device ID (optional for all)",
        },
      },
      required: ["target"],
    },
  },
  {
    name: "analyze_network",
    description: "Analyze mobile app network traffic",
    parameters: {
      type: "object",
      properties: {
        appId: {
          type: "string",
          description: "App ID to monitor",
        },
        duration: {
          type: "number",
          description: "Monitoring duration in seconds",
        },
      },
      required: ["appId"],
    },
  },
  {
    name: "generate_report",
    description: "Generate mobile security report",
    parameters: {
      type: "object",
      properties: {
        reportType: {
          type: "string",
          enum: ["app", "device", "compliance", "executive"],
          description: "Type of report",
        },
        targetId: {
          type: "string",
          description: "App or device ID",
        },
      },
      required: ["reportType"],
    },
  },
];

export default mobiledefendTools;
