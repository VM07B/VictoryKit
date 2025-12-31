export const iotsecureTools = [
  {
    name: "scan_network",
    description: "Scan network for IoT devices",
    parameters: {
      type: "object",
      properties: {
        networkRange: {
          type: "string",
          description: "Network range to scan (e.g., 192.168.1.0/24)",
        },
        deepScan: {
          type: "boolean",
          description: "Perform deep protocol analysis",
        },
      },
      required: ["networkRange"],
    },
  },
  {
    name: "analyze_device",
    description: "Analyze IoT device security",
    parameters: {
      type: "object",
      properties: {
        deviceId: {
          type: "string",
          description: "Device ID to analyze",
        },
        analysisType: {
          type: "string",
          enum: ["quick", "full", "firmware"],
          description: "Type of analysis to perform",
        },
      },
      required: ["deviceId"],
    },
  },
  {
    name: "check_firmware",
    description: "Check firmware for vulnerabilities",
    parameters: {
      type: "object",
      properties: {
        deviceId: {
          type: "string",
          description: "Device ID",
        },
        firmwareFile: {
          type: "string",
          description: "Firmware file path or URL",
        },
      },
      required: ["deviceId"],
    },
  },
  {
    name: "monitor_protocol",
    description: "Monitor IoT protocol traffic",
    parameters: {
      type: "object",
      properties: {
        protocol: {
          type: "string",
          enum: ["mqtt", "coap", "zigbee", "zwave", "ble", "http"],
          description: "Protocol to monitor",
        },
        duration: {
          type: "number",
          description: "Monitoring duration in seconds",
        },
      },
      required: ["protocol"],
    },
  },
  {
    name: "segment_network",
    description: "Configure IoT network segmentation",
    parameters: {
      type: "object",
      properties: {
        segmentName: {
          type: "string",
          description: "Name for the network segment",
        },
        deviceIds: {
          type: "array",
          items: { type: "string" },
          description: "Device IDs to include in segment",
        },
      },
      required: ["segmentName", "deviceIds"],
    },
  },
  {
    name: "generate_report",
    description: "Generate IoT security report",
    parameters: {
      type: "object",
      properties: {
        reportType: {
          type: "string",
          enum: ["summary", "detailed", "compliance", "executive"],
          description: "Type of report to generate",
        },
        deviceIds: {
          type: "array",
          items: { type: "string" },
          description: "Specific devices to include (empty for all)",
        },
      },
      required: ["reportType"],
    },
  },
];

export default iotsecureTools;
