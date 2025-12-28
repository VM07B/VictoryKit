/**
 * xAI Grok Service
 */

import axios from 'axios';
import { LLMProvider, ChatOptions, StreamChunk } from './llmRouter.js';
import { logger } from '../utils/logger.js';

export class XAIService implements LLMProvider {
  name = 'xai';
  private apiKey: string | null = null;
  private baseUrl = 'https://api.x.ai/v1';
  private model = 'grok-beta';

  constructor() {
    this.apiKey = process.env.XAI_API_KEY || null;
    if (this.apiKey) {
      logger.info('xAI Grok service initialized');
    } else {
      logger.warn('xAI API key not configured');
    }
  }

  isAvailable(): boolean {
    return this.apiKey !== null;
  }

  async *streamChat(message: string, options: ChatOptions): AsyncGenerator<StreamChunk> {
    if (!this.apiKey) {
      throw new Error('xAI client not initialized');
    }

    try {
      const messages = [];
      
      if (options.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }
      messages.push({ role: 'user', content: message });

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 2048,
          stream: true,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'stream',
        }
      );

      let buffer = '';
      
      for await (const chunk of response.data) {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield { type: 'text', content };
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      logger.error('xAI streaming error:', error);
      throw error;
    }
  }
}

export default XAIService;
