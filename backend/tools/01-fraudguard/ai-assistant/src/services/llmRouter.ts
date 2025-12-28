/**
 * LLM Router - Routes requests to appropriate LLM providers
 */

import { GeminiService } from './geminiService.js';
import { ClaudeService } from './claudeService.js';
import { OpenAIService } from './openaiService.js';
import { XAIService } from './xaiService.js';
import { MistralService } from './mistralService.js';
import { LlamaService } from './llamaService.js';
import { logger } from '../utils/logger.js';

export interface StreamChunk {
  type: 'text' | 'function_call';
  content?: string;
  functionCall?: {
    name: string;
    arguments: Record<string, any>;
  };
}

export interface ChatOptions {
  conversationId?: string;
  tools?: any[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMProvider {
  name: string;
  isAvailable(): boolean;
  streamChat(message: string, options: ChatOptions): AsyncGenerator<StreamChunk>;
}

export class LLMRouter {
  private providers: Map<string, LLMProvider> = new Map();

  constructor() {
    // Initialize all providers
    this.registerProvider('gemini', new GeminiService());
    this.registerProvider('claude', new ClaudeService());
    this.registerProvider('openai', new OpenAIService());
    this.registerProvider('xai', new XAIService());
    this.registerProvider('mistral', new MistralService());
    this.registerProvider('llama', new LlamaService());

    logger.info(`LLM Router initialized with ${this.providers.size} providers`);
  }

  registerProvider(name: string, provider: LLMProvider): void {
    this.providers.set(name, provider);
    logger.info(`Registered LLM provider: ${name} (available: ${provider.isAvailable()})`);
  }

  getProvider(name: string): LLMProvider | undefined {
    return this.providers.get(name);
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.entries())
      .filter(([_, provider]) => provider.isAvailable())
      .map(([name]) => name);
  }

  async *streamChat(
    providerName: string,
    message: string,
    options: ChatOptions = {}
  ): AsyncGenerator<StreamChunk> {
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    if (!provider.isAvailable()) {
      // Fallback to first available provider
      const available = this.getAvailableProviders();
      if (available.length === 0) {
        throw new Error('No LLM providers available');
      }
      const fallbackProvider = this.providers.get(available[0])!;
      logger.warn(`Provider ${providerName} unavailable, falling back to ${available[0]}`);
      yield* fallbackProvider.streamChat(message, options);
      return;
    }

    yield* provider.streamChat(message, options);
  }
}

export default LLMRouter;
