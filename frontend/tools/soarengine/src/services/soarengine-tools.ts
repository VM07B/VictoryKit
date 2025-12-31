export const soarEngineTools = [
  {
    name: "run_playbook",
    description: "Execute a security playbook",
    parameters: {
      type: "object",
      properties: {
        playbookId: { type: "string" },
        parameters: { type: "object" },
        dryRun: { type: "boolean" },
      },
      required: ["playbookId"],
    },
  },
  {
    name: "create_playbook",
    description: "Create new automation playbook",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string" },
        trigger: { type: "string" },
        steps: { type: "array" },
      },
      required: ["name", "trigger"],
    },
  },
  {
    name: "manage_integration",
    description: "Manage security tool integration",
    parameters: {
      type: "object",
      properties: {
        integrationId: { type: "string" },
        action: {
          type: "string",
          enum: ["connect", "disconnect", "test", "sync"],
        },
      },
      required: ["integrationId", "action"],
    },
  },
  {
    name: "create_automation_rule",
    description: "Create automation rule",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string" },
        condition: { type: "object" },
        action: { type: "object" },
      },
      required: ["name", "condition", "action"],
    },
  },
];
