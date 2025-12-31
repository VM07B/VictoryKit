export const privacyshieldTools = [
  {
    name: "scan_pii",
    description: "Scan for personal identifiable information",
    parameters: {
      type: "object",
      properties: {
        source: {
          type: "string",
          description: "Data source to scan",
        },
        piiTypes: {
          type: "array",
          items: { type: "string" },
          description: "Specific PII types to look for",
        },
        deepScan: {
          type: "boolean",
          description: "Perform deep content analysis",
        },
      },
      required: ["source"],
    },
  },
  {
    name: "process_dsar",
    description: "Process a data subject access request",
    parameters: {
      type: "object",
      properties: {
        requestType: {
          type: "string",
          enum: [
            "access",
            "deletion",
            "rectification",
            "portability",
            "restriction",
          ],
          description: "Type of DSAR",
        },
        subjectEmail: {
          type: "string",
          description: "Email of the data subject",
        },
        scope: {
          type: "string",
          description: "Scope of the request",
        },
      },
      required: ["requestType", "subjectEmail"],
    },
  },
  {
    name: "assess_privacy_impact",
    description: "Conduct a privacy impact assessment",
    parameters: {
      type: "object",
      properties: {
        projectName: {
          type: "string",
          description: "Project or initiative name",
        },
        description: {
          type: "string",
          description: "Project description",
        },
        dataTypes: {
          type: "array",
          items: { type: "string" },
          description: "Types of personal data involved",
        },
      },
      required: ["projectName", "description"],
    },
  },
  {
    name: "check_compliance",
    description: "Check compliance with privacy regulations",
    parameters: {
      type: "object",
      properties: {
        regulation: {
          type: "string",
          enum: ["GDPR", "CCPA", "HIPAA", "LGPD", "PIPEDA"],
          description: "Regulation to check against",
        },
        scope: {
          type: "string",
          enum: ["full", "data-processing", "consent", "rights"],
          description: "Compliance check scope",
        },
      },
      required: ["regulation"],
    },
  },
  {
    name: "report_breach",
    description: "Report and manage a data breach",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Breach title",
        },
        description: {
          type: "string",
          description: "Breach description",
        },
        affectedData: {
          type: "array",
          items: { type: "string" },
          description: "Types of data affected",
        },
        estimatedSubjects: {
          type: "number",
          description: "Estimated affected individuals",
        },
      },
      required: ["title", "description"],
    },
  },
  {
    name: "generate_report",
    description: "Generate privacy compliance report",
    parameters: {
      type: "object",
      properties: {
        reportType: {
          type: "string",
          enum: [
            "compliance",
            "data-inventory",
            "dsar-summary",
            "breach-history",
            "consent-audit",
          ],
          description: "Report type",
        },
        timeRange: {
          type: "string",
          enum: ["30d", "90d", "1y", "all"],
          description: "Time range",
        },
      },
      required: ["reportType"],
    },
  },
];

export default privacyshieldTools;
