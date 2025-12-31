export const botDefenderTools = [
  {
    name: "get_bot_sessions",
    description: "Get bot detection sessions",
    parameters: {
      type: "object",
      properties: { isBot: { type: "boolean" }, blocked: { type: "boolean" } },
    },
  },
  {
    name: "analyze_traffic",
    description: "Analyze traffic for bot patterns",
    parameters: {
      type: "object",
      properties: { ip: { type: "string" }, userAgent: { type: "string" } },
    },
  },
  {
    name: "block_bot",
    description: "Block a detected bot",
    parameters: {
      type: "object",
      properties: { sessionId: { type: "string" } },
      required: ["sessionId"],
    },
  },
  {
    name: "configure_captcha",
    description: "Configure CAPTCHA settings",
    parameters: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["image", "audio", "invisible", "turnstile"],
        },
        threshold: { type: "number" },
      },
    },
  },
];
