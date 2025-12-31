/**
 * Unified AI Provider Service for VictoryKit
 * Supports OpenAI, Anthropic, and Google Gemini with seamless provider switching
 */

const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pino = require('pino');

const logger = pino({ name: 'ai-provider' });

// Provider configurations
const providers = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GEMINI: 'gemini',
};

// Model mappings
const models = {
  openai: {
    default: 'gpt-4-turbo-preview',
    fast: 'gpt-3.5-turbo',
    vision: 'gpt-4-vision-preview',
    embedding: 'text-embedding-3-small',
  },
  anthropic: {
    default: 'claude-3-opus-20240229',
    fast: 'claude-3-haiku-20240307',
    vision: 'claude-3-opus-20240229',
  },
  gemini: {
    default: 'gemini-pro',
    fast: 'gemini-pro',
    vision: 'gemini-pro-vision',
  },
};

// Provider instances
let openaiClient = null;
let anthropicClient = null;
let geminiClient = null;

/**
 * Initialize AI providers
 * @param {object} config - Provider API keys
 */
function initializeProviders(config = {}) {
  // OpenAI
  if (config.openaiApiKey || process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({
      apiKey: config.openaiApiKey || process.env.OPENAI_API_KEY,
    });
    logger.info('OpenAI provider initialized');
  }

  // Anthropic
  if (config.anthropicApiKey || process.env.ANTHROPIC_API_KEY) {
    anthropicClient = new Anthropic({
      apiKey: config.anthropicApiKey || process.env.ANTHROPIC_API_KEY,
    });
    logger.info('Anthropic provider initialized');
  }

  // Google Gemini
  if (config.geminiApiKey || process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenerativeAI(
      config.geminiApiKey || process.env.GEMINI_API_KEY
    );
    logger.info('Google Gemini provider initialized');
  }
}

/**
 * Get available providers
 * @returns {string[]}
 */
function getAvailableProviders() {
  const available = [];
  if (openaiClient) available.push(providers.OPENAI);
  if (anthropicClient) available.push(providers.ANTHROPIC);
  if (geminiClient) available.push(providers.GEMINI);
  return available;
}

/**
 * Unified chat completion interface
 * @param {object} options - Chat options
 * @returns {Promise<object>}
 */
async function chat(options) {
  const {
    provider = process.env.DEFAULT_AI_PROVIDER || providers.OPENAI,
    model,
    messages,
    temperature = 0.7,
    maxTokens = 4096,
    stream = false,
    tools,
    toolChoice,
  } = options;

  const startTime = Date.now();

  try {
    let result;

    switch (provider) {
      case providers.OPENAI:
        result = await chatOpenAI({ model, messages, temperature, maxTokens, stream, tools, toolChoice });
        break;
      case providers.ANTHROPIC:
        result = await chatAnthropic({ model, messages, temperature, maxTokens, stream, tools });
        break;
      case providers.GEMINI:
        result = await chatGemini({ model, messages, temperature, maxTokens, stream });
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    const duration = Date.now() - startTime;
    logger.info({ provider, model: result.model, duration, tokens: result.usage }, 'Chat completion');

    return result;
  } catch (error) {
    logger.error({ provider, error: error.message }, 'Chat completion failed');
    throw error;
  }
}

/**
 * OpenAI chat completion
 */
async function chatOpenAI({ model, messages, temperature, maxTokens, stream, tools, toolChoice }) {
  if (!openaiClient) throw new Error('OpenAI not initialized');

  const modelName = model || models.openai.default;
  
  const params = {
    model: modelName,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream,
  };

  if (tools) params.tools = tools;
  if (toolChoice) params.tool_choice = toolChoice;

  const response = await openaiClient.chat.completions.create(params);

  if (stream) {
    return response; // Return async iterator for streaming
  }

  return {
    provider: providers.OPENAI,
    model: modelName,
    content: response.choices[0]?.message?.content,
    toolCalls: response.choices[0]?.message?.tool_calls,
    finishReason: response.choices[0]?.finish_reason,
    usage: response.usage,
  };
}

/**
 * Anthropic chat completion
 */
async function chatAnthropic({ model, messages, temperature, maxTokens, stream, tools }) {
  if (!anthropicClient) throw new Error('Anthropic not initialized');

  const modelName = model || models.anthropic.default;

  // Convert messages format for Anthropic
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const conversationMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

  const params = {
    model: modelName,
    max_tokens: maxTokens,
    temperature,
    system: systemMessage,
    messages: conversationMessages,
    stream,
  };

  if (tools) {
    params.tools = tools.map(t => ({
      name: t.function.name,
      description: t.function.description,
      input_schema: t.function.parameters,
    }));
  }

  const response = await anthropicClient.messages.create(params);

  if (stream) {
    return response;
  }

  // Extract tool use if present
  const toolUse = response.content.find(c => c.type === 'tool_use');
  const textContent = response.content.find(c => c.type === 'text');

  return {
    provider: providers.ANTHROPIC,
    model: modelName,
    content: textContent?.text || '',
    toolCalls: toolUse ? [{
      id: toolUse.id,
      type: 'function',
      function: {
        name: toolUse.name,
        arguments: JSON.stringify(toolUse.input),
      },
    }] : undefined,
    finishReason: response.stop_reason,
    usage: {
      prompt_tokens: response.usage.input_tokens,
      completion_tokens: response.usage.output_tokens,
      total_tokens: response.usage.input_tokens + response.usage.output_tokens,
    },
  };
}

/**
 * Google Gemini chat completion
 */
async function chatGemini({ model, messages, temperature, maxTokens, stream }) {
  if (!geminiClient) throw new Error('Gemini not initialized');

  const modelName = model || models.gemini.default;
  const geminiModel = geminiClient.getGenerativeModel({ model: modelName });

  // Convert messages format for Gemini
  const systemInstruction = messages.find(m => m.role === 'system')?.content;
  const history = messages
    .filter(m => m.role !== 'system')
    .slice(0, -1)
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const lastMessage = messages[messages.length - 1];

  const chat = geminiModel.startChat({
    history,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
    ...(systemInstruction && { systemInstruction }),
  });

  if (stream) {
    const result = await chat.sendMessageStream(lastMessage.content);
    return result.stream;
  }

  const result = await chat.sendMessage(lastMessage.content);
  const response = result.response;

  return {
    provider: providers.GEMINI,
    model: modelName,
    content: response.text(),
    finishReason: response.candidates?.[0]?.finishReason,
    usage: {
      prompt_tokens: response.usageMetadata?.promptTokenCount || 0,
      completion_tokens: response.usageMetadata?.candidatesTokenCount || 0,
      total_tokens: response.usageMetadata?.totalTokenCount || 0,
    },
  };
}

/**
 * Generate embeddings
 * @param {object} options - Embedding options
 * @returns {Promise<number[][]>}
 */
async function generateEmbeddings(options) {
  const {
    provider = providers.OPENAI,
    model,
    texts,
  } = options;

  if (provider === providers.OPENAI && openaiClient) {
    const response = await openaiClient.embeddings.create({
      model: model || models.openai.embedding,
      input: texts,
    });
    return response.data.map(d => d.embedding);
  }

  if (provider === providers.GEMINI && geminiClient) {
    const embedModel = geminiClient.getGenerativeModel({ model: 'embedding-001' });
    const results = await Promise.all(
      texts.map(text => embedModel.embedContent(text))
    );
    return results.map(r => r.embedding.values);
  }

  throw new Error(`Embeddings not supported for provider: ${provider}`);
}

/**
 * Stream chat completion with callback
 * @param {object} options - Chat options
 * @param {Function} onChunk - Callback for each chunk
 * @returns {Promise<string>}
 */
async function streamChat(options, onChunk) {
  const result = await chat({ ...options, stream: true });
  let fullContent = '';

  if (options.provider === providers.OPENAI) {
    for await (const chunk of result) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullContent += content;
      onChunk(content);
    }
  } else if (options.provider === providers.ANTHROPIC) {
    for await (const event of result) {
      if (event.type === 'content_block_delta') {
        const content = event.delta?.text || '';
        fullContent += content;
        onChunk(content);
      }
    }
  } else if (options.provider === providers.GEMINI) {
    for await (const chunk of result) {
      const content = chunk.text();
      fullContent += content;
      onChunk(content);
    }
  }

  return fullContent;
}

/**
 * Security-focused system prompts for VictoryKit tools
 */
const securityPrompts = {
  malwareAnalysis: `You are an expert malware analyst. Analyze the provided file or code for potential threats, 
    malicious behaviors, suspicious patterns, and security risks. Provide detailed technical analysis including:
    - File type and structure analysis
    - Suspicious API calls or system interactions
    - Network communication patterns
    - Persistence mechanisms
    - Obfuscation techniques
    - Risk assessment and severity rating`,

  vulnerabilityScanning: `You are a security vulnerability expert. Analyze code, configurations, or systems for 
    potential security vulnerabilities. Identify issues based on OWASP guidelines, CWE classifications, and 
    industry best practices. For each finding, provide:
    - Vulnerability type and severity (CVSS score if applicable)
    - Affected component/location
    - Detailed description
    - Potential impact
    - Remediation recommendations
    - Code fix examples where applicable`,

  phishingDetection: `You are a phishing and social engineering detection specialist. Analyze the provided 
    content (emails, URLs, messages) for phishing indicators. Evaluate:
    - URL legitimacy and reputation
    - Email header analysis
    - Content manipulation techniques
    - Brand impersonation attempts
    - Urgency and pressure tactics
    - Technical indicators (SPF, DKIM, DMARC)
    Provide a confidence score and detailed reasoning.`,

  incidentResponse: `You are a cybersecurity incident response specialist. Help analyze and respond to 
    security incidents. Provide:
    - Incident classification and severity
    - Root cause analysis
    - Containment strategies
    - Eradication steps
    - Recovery procedures
    - Lessons learned and prevention measures
    Follow NIST incident response framework guidelines.`,

  complianceCheck: `You are a security compliance expert familiar with GDPR, HIPAA, PCI-DSS, SOC2, ISO 27001, 
    and other frameworks. Analyze the provided information for compliance gaps and provide:
    - Applicable regulatory requirements
    - Current compliance status
    - Gap analysis
    - Remediation priorities
    - Documentation requirements
    - Implementation guidance`,
};

module.exports = {
  providers,
  models,
  initializeProviders,
  getAvailableProviders,
  chat,
  streamChat,
  generateEmbeddings,
  securityPrompts,
  // Direct provider access if needed
  getOpenAIClient: () => openaiClient,
  getAnthropicClient: () => anthropicClient,
  getGeminiClient: () => geminiClient,
};
