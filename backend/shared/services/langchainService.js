/**
 * Langchain Orchestration Service for VictoryKit
 * Provides agent chains, tools, memory management, and RAG capabilities
 */

const { ChatOpenAI } = require("@langchain/openai");
const { ChatAnthropic } = require("@langchain/anthropic");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const {
  AgentExecutor,
  createOpenAIFunctionsAgent,
  createStructuredChatAgent,
} = require("langchain/agents");
const {
  ChatPromptTemplate,
  MessagesPlaceholder,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} = require("@langchain/core/prompts");
const { BufferMemory, ConversationSummaryMemory } = require("langchain/memory");
const { DynamicTool, DynamicStructuredTool } = require("@langchain/core/tools");
const {
  RunnableSequence,
  RunnablePassthrough,
} = require("@langchain/core/runnables");
const {
  StringOutputParser,
  JsonOutputParser,
} = require("@langchain/core/output_parsers");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { z } = require("zod");
const pino = require("pino");

const logger = pino({ name: "langchain-service" });

// Model instances cache
const modelCache = new Map();
const memoryCache = new Map();

/**
 * Get or create a chat model instance
 * @param {string} provider - Provider name
 * @param {object} options - Model options
 * @returns {BaseChatModel}
 */
function getChatModel(provider = "openai", options = {}) {
  const cacheKey = `${provider}-${JSON.stringify(options)}`;

  if (modelCache.has(cacheKey)) {
    return modelCache.get(cacheKey);
  }

  let model;
  const { temperature = 0.7, maxTokens = 4096, streaming = false } = options;

  switch (provider) {
    case "openai":
      model = new ChatOpenAI({
        modelName: options.model || "gpt-4-turbo-preview",
        temperature,
        maxTokens,
        streaming,
        openAIApiKey: process.env.OPENAI_API_KEY,
      });
      break;
    case "anthropic":
      model = new ChatAnthropic({
        modelName: options.model || "claude-3-opus-20240229",
        temperature,
        maxTokens,
        streaming,
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      });
      break;
    case "gemini":
      model = new ChatGoogleGenerativeAI({
        modelName: options.model || "gemini-pro",
        temperature,
        maxOutputTokens: maxTokens,
        streaming,
        apiKey: process.env.GEMINI_API_KEY,
      });
      break;
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }

  modelCache.set(cacheKey, model);
  return model;
}

/**
 * Get or create conversation memory
 * @param {string} sessionId - Session identifier
 * @param {object} options - Memory options
 * @returns {BaseMemory}
 */
function getMemory(sessionId, options = {}) {
  const cacheKey = `memory-${sessionId}`;

  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey);
  }

  const memory = options.useSummary
    ? new ConversationSummaryMemory({
        memoryKey: "chat_history",
        returnMessages: true,
        llm: getChatModel("openai", { temperature: 0 }),
      })
    : new BufferMemory({
        memoryKey: "chat_history",
        returnMessages: true,
        inputKey: "input",
        outputKey: "output",
      });

  memoryCache.set(cacheKey, memory);
  return memory;
}

/**
 * Clear session memory
 * @param {string} sessionId - Session identifier
 */
function clearMemory(sessionId) {
  const cacheKey = `memory-${sessionId}`;
  if (memoryCache.has(cacheKey)) {
    memoryCache.delete(cacheKey);
    logger.info({ sessionId }, "Memory cleared");
  }
}

/**
 * VictoryKit Security Tools for Langchain Agents
 */
const securityTools = {
  /**
   * URL Scanner Tool
   */
  urlScanner: new DynamicStructuredTool({
    name: "url_scanner",
    description:
      "Scan a URL for phishing, malware, and security threats. Returns risk score and detailed analysis.",
    schema: z.object({
      url: z.string().url().describe("The URL to scan"),
      deepScan: z
        .boolean()
        .optional()
        .describe("Perform deep analysis including page content"),
    }),
    func: async ({ url, deepScan }) => {
      // Integration point for PhishGuard API
      logger.info({ url, deepScan }, "URL scan requested");
      return JSON.stringify({
        url,
        status: "scanned",
        riskScore: 0,
        threats: [],
        note: "Connect to PhishGuard API for real results",
      });
    },
  }),

  /**
   * File Hash Analyzer Tool
   */
  hashAnalyzer: new DynamicStructuredTool({
    name: "hash_analyzer",
    description:
      "Check file hash against known malware databases. Supports MD5, SHA1, SHA256.",
    schema: z.object({
      hash: z.string().describe("File hash to analyze"),
      hashType: z
        .enum(["md5", "sha1", "sha256"])
        .optional()
        .describe("Hash algorithm type"),
    }),
    func: async ({ hash, hashType }) => {
      // Integration point for MalwareHunter API
      logger.info({ hash, hashType }, "Hash analysis requested");
      return JSON.stringify({
        hash,
        hashType: hashType || "sha256",
        status: "analyzed",
        malwareFamily: null,
        detections: 0,
        note: "Connect to MalwareHunter API for real results",
      });
    },
  }),

  /**
   * Vulnerability Lookup Tool
   */
  vulnLookup: new DynamicStructuredTool({
    name: "vulnerability_lookup",
    description:
      "Search for known vulnerabilities by CVE ID, software name, or keyword.",
    schema: z.object({
      query: z.string().describe("CVE ID or search term"),
      type: z
        .enum(["cve", "software", "keyword"])
        .optional()
        .describe("Search type"),
    }),
    func: async ({ query, type }) => {
      // Integration point for VulnScan API
      logger.info({ query, type }, "Vulnerability lookup requested");
      return JSON.stringify({
        query,
        type: type || "keyword",
        results: [],
        note: "Connect to VulnScan API for real results",
      });
    },
  }),

  /**
   * Code Security Scanner Tool
   */
  codeScanner: new DynamicStructuredTool({
    name: "code_scanner",
    description:
      "Scan code snippet for security vulnerabilities, injection risks, and best practice violations.",
    schema: z.object({
      code: z.string().describe("Code to analyze"),
      language: z.string().describe("Programming language"),
    }),
    func: async ({ code, language }) => {
      // Integration point for SecureCode API
      logger.info({ language, codeLength: code.length }, "Code scan requested");
      return JSON.stringify({
        language,
        scanned: true,
        vulnerabilities: [],
        suggestions: [],
        note: "Connect to SecureCode API for real results",
      });
    },
  }),

  /**
   * Compliance Checker Tool
   */
  complianceChecker: new DynamicStructuredTool({
    name: "compliance_checker",
    description:
      "Check compliance against security frameworks like GDPR, HIPAA, PCI-DSS, SOC2.",
    schema: z.object({
      framework: z
        .enum(["gdpr", "hipaa", "pci-dss", "soc2", "iso27001"])
        .describe("Compliance framework"),
      context: z.string().describe("Context or data to check"),
    }),
    func: async ({ framework, context }) => {
      // Integration point for ComplianceCheck API
      logger.info({ framework }, "Compliance check requested");
      return JSON.stringify({
        framework,
        status: "checked",
        findings: [],
        score: 0,
        note: "Connect to ComplianceCheck API for real results",
      });
    },
  }),
};

/**
 * Create a security analysis agent
 * @param {object} options - Agent options
 * @returns {AgentExecutor}
 */
async function createSecurityAgent(options = {}) {
  const {
    provider = "openai",
    tools = Object.values(securityTools),
    systemPrompt = "You are a cybersecurity expert assistant. Use the available tools to analyze threats and provide security recommendations.",
    sessionId,
  } = options;

  const model = getChatModel(provider, { temperature: 0.3 });
  const memory = sessionId ? getMemory(sessionId) : null;

  const prompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(systemPrompt),
    new MessagesPlaceholder("chat_history"),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    tools,
    prompt,
  });

  const executor = new AgentExecutor({
    agent,
    tools,
    memory,
    verbose: process.env.NODE_ENV === "development",
    handleParsingErrors: true,
    maxIterations: 10,
  });

  logger.info({ provider, toolCount: tools.length }, "Security agent created");
  return executor;
}

/**
 * Create a RAG (Retrieval Augmented Generation) chain
 * @param {object} options - RAG options
 * @returns {RunnableSequence}
 */
async function createRAGChain(options = {}) {
  const {
    provider = "openai",
    documents = [],
    chunkSize = 1000,
    chunkOverlap = 200,
  } = options;

  // Split documents
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });
  const splits = await splitter.createDocuments(
    documents.map((d) => d.content),
    documents.map((d) => d.metadata || {})
  );

  // Create vector store
  const embeddings = new OpenAIEmbeddings();
  const vectorStore = await MemoryVectorStore.fromDocuments(splits, embeddings);
  const retriever = vectorStore.asRetriever({ k: 4 });

  // Create RAG chain
  const model = getChatModel(provider, { temperature: 0.5 });

  const ragPrompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(
      `You are a security expert. Use the following context to answer questions accurately.
      If you don't know the answer, say so. Don't make up information.
      
      Context: {context}`
    ),
    HumanMessagePromptTemplate.fromTemplate("{question}"),
  ]);

  const formatDocs = (docs) => docs.map((d) => d.pageContent).join("\n\n");

  const chain = RunnableSequence.from([
    {
      context: retriever.pipe(formatDocs),
      question: new RunnablePassthrough(),
    },
    ragPrompt,
    model,
    new StringOutputParser(),
  ]);

  logger.info(
    { documentCount: documents.length, splitCount: splits.length },
    "RAG chain created"
  );
  return chain;
}

/**
 * Create a simple analysis chain (no tools)
 * @param {object} options - Chain options
 * @returns {RunnableSequence}
 */
function createAnalysisChain(options = {}) {
  const { provider = "openai", systemPrompt, outputFormat = "text" } = options;

  const model = getChatModel(provider, { temperature: 0.3 });

  const prompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(
      systemPrompt || "Analyze the following and provide detailed insights:"
    ),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
  ]);

  const parser =
    outputFormat === "json" ? new JsonOutputParser() : new StringOutputParser();

  return RunnableSequence.from([prompt, model, parser]);
}

/**
 * Run security analysis with agent
 * @param {string} input - User input/question
 * @param {object} options - Agent options
 * @returns {Promise<object>}
 */
async function runSecurityAnalysis(input, options = {}) {
  const startTime = Date.now();

  try {
    const agent = await createSecurityAgent(options);
    const result = await agent.invoke({ input });

    const duration = Date.now() - startTime;
    logger.info(
      { duration, hasOutput: !!result.output },
      "Security analysis completed"
    );

    return {
      success: true,
      output: result.output,
      intermediateSteps: result.intermediateSteps,
      duration,
    };
  } catch (error) {
    logger.error({ error: error.message }, "Security analysis failed");
    return {
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Stream agent response
 * @param {string} input - User input
 * @param {object} options - Agent options
 * @param {Function} onToken - Token callback
 * @returns {Promise<string>}
 */
async function streamSecurityAnalysis(input, options = {}, onToken) {
  const agent = await createSecurityAgent({
    ...options,
    provider: "openai", // Streaming works best with OpenAI
  });

  let fullResponse = "";

  const stream = await agent.stream({ input });

  for await (const chunk of stream) {
    if (chunk.output) {
      fullResponse = chunk.output;
      onToken(chunk.output);
    }
  }

  return fullResponse;
}

module.exports = {
  // Core functions
  getChatModel,
  getMemory,
  clearMemory,

  // Security tools
  securityTools,

  // Agent and chain creators
  createSecurityAgent,
  createRAGChain,
  createAnalysisChain,

  // Execution functions
  runSecurityAnalysis,
  streamSecurityAnalysis,

  // Utilities
  DynamicTool,
  DynamicStructuredTool,
  ChatPromptTemplate,
};
