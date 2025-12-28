/**
 * Mistral AI Service
 */

import MistralClient from '@mistralai/mistralai';
import { LLMProvider, ChatOptions, StreamChunk } from './llmRouter.js';
import { logger } from '../utils/logger.js';

export class MistralService implements LLMProvider {
  name = 'mistral';
  private client: MistralClient | null = null;
  private model = 'mistral-large-latest';

  constructor() {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (apiKey) {
      this.client = new MistralClient(apiKey);
      logger.info('Mistral service initialized');
    } else {
      logger.warn('Mistral API key not configured');
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async *streamChat(message: string, options: ChatOptions): AsyncGenerator<StreamChunk> {
    if (!this.client) {
      throw new Error('Mistral client not initialized');
    }

    try {
      const messages: any[] = [];
      
      if (options.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }
      messages.push({ role: 'user', content: message });

      const stream = await this.client.chatStream({
        model: this.model,
        messages,
        temperature: options.temperature ?? 0.7,
        maxTokens: options.maxTokens ?? 2048,
        tools: options.tools?.map(tool => ({
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          },
        })),
      });

      for await (const chunk of stream) {
        const content = chunk.choices?.[0]?.delta?.content;
        if (content) {
          yield { type: 'text', content };
        }
      }
    } catch (error) {
      logger.error('Mistral streaming error:', error);
      throw error;
    }
  }
}

export default MistralService;
