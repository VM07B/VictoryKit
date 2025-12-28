/**
 * Anthropic Claude Service
 */

import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider, ChatOptions, StreamChunk } from './llmRouter.js';
import { logger } from '../utils/logger.js';

export class ClaudeService implements LLMProvider {
  name = 'claude';
  private client: Anthropic | null = null;
  private model = 'claude-3-sonnet-20240229';

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
      logger.info('Claude service initialized');
    } else {
      logger.warn('Anthropic API key not configured');
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async *streamChat(message: string, options: ChatOptions): AsyncGenerator<StreamChunk> {
    if (!this.client) {
      throw new Error('Claude client not initialized');
    }

    try {
      const stream = await this.client.messages.stream({
        model: this.model,
        max_tokens: options.maxTokens ?? 2048,
        system: options.systemPrompt,
        messages: [
          { role: 'user', content: message }
        ],
        tools: options.tools?.map(tool => ({
          name: tool.name,
          description: tool.description,
          input_schema: tool.parameters,
        })),
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          const delta = event.delta as any;
          if (delta.type === 'text_delta') {
            yield { type: 'text', content: delta.text };
          } else if (delta.type === 'input_json_delta') {
            // Handle tool use
          }
        }
      }
    } catch (error) {
      logger.error('Claude streaming error:', error);
      throw error;
    }
  }
}

export default ClaudeService;
