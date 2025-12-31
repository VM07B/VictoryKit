export const backupguardTools = [
  {
    name: "create_backup",
    description: "Create a new backup job",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Backup job name",
        },
        source: {
          type: "string",
          description: "Source path or system",
        },
        destination: {
          type: "string",
          description: "Backup destination",
        },
        type: {
          type: "string",
          enum: ["full", "incremental", "differential"],
          description: "Backup type",
        },
        encrypted: {
          type: "boolean",
          description: "Enable encryption",
        },
        immutable: {
          type: "boolean",
          description: "Make backup immutable",
        },
      },
      required: ["name", "source", "destination"],
    },
  },
  {
    name: "verify_backup",
    description: "Verify backup integrity",
    parameters: {
      type: "object",
      properties: {
        backupId: {
          type: "string",
          description: "Backup ID to verify",
        },
        deepScan: {
          type: "boolean",
          description: "Perform deep integrity scan",
        },
      },
      required: ["backupId"],
    },
  },
  {
    name: "test_restore",
    description: "Test backup restore capability",
    parameters: {
      type: "object",
      properties: {
        backupId: {
          type: "string",
          description: "Backup ID to test",
        },
        sampleSize: {
          type: "number",
          description: "Percentage of files to test",
        },
      },
      required: ["backupId"],
    },
  },
  {
    name: "scan_ransomware",
    description: "Scan for ransomware threats",
    parameters: {
      type: "object",
      properties: {
        target: {
          type: "string",
          enum: ["all", "active", "recent"],
          description: "Scan target scope",
        },
        depth: {
          type: "string",
          enum: ["quick", "standard", "deep"],
          description: "Scan depth",
        },
      },
      required: ["target"],
    },
  },
  {
    name: "configure_immutable",
    description: "Configure immutable backup settings",
    parameters: {
      type: "object",
      properties: {
        backupId: {
          type: "string",
          description: "Backup ID",
        },
        retentionDays: {
          type: "number",
          description: "Immutability retention period in days",
        },
        allowDelete: {
          type: "boolean",
          description: "Allow deletion after retention",
        },
      },
      required: ["backupId", "retentionDays"],
    },
  },
  {
    name: "generate_report",
    description: "Generate backup security report",
    parameters: {
      type: "object",
      properties: {
        reportType: {
          type: "string",
          enum: ["status", "integrity", "security", "compliance"],
          description: "Report type",
        },
        timeRange: {
          type: "string",
          enum: ["24h", "7d", "30d", "90d"],
          description: "Time range for report",
        },
      },
      required: ["reportType"],
    },
  },
];

export default backupguardTools;
