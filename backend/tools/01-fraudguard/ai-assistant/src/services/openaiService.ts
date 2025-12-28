/**
 * OpenAI GPT Service
 */

import OpenAI from 'openai';
import { LLMProvider, ChatOptions, StreamChunk } from './llmRouter.js';
import { logger } from '../utils/logger.js';

export class OpenAIService implements LLMProvider {
  name = 'openai';
  private client: OpenAI | null = null;
  private model = 'gpt-4-turbo-preview';

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
      logger.info('OpenAI service initialized');
    } else {
      logger.warn('OpenAI API key not configured');
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async *streamChat(message: string, options: ChatOptions): AsyncGenerator<StreamChunk> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const messages: OpenAI.ChatCompletionMessageParam[] = [];
      
      if (options.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }
      messages.push({ role: 'user', content: message });

      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        stream: true,
        tools: options.tools?.map(tool => ({
          type: 'function' as const,
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          },
        })),
      });

      let functionCallName = '';
      let functionCallArgs = '';

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        
        if (delta?.content) {
          yield { type: 'text', content: delta.content };
        }

        if (delta?.tool_calls) {
          for (const toolCall of delta.tool_calls) {
            if (toolCall.function?.name) {
              functionCallName = toolCall.function.name;
            }
            if (toolCall.function?.arguments) {
              functionCallArgs += toolCall.function.arguments;
            }
          }
        }
      }

      if (functionCallName) {
        yield {
          type: 'function_call',
          functionCall: {
            name: functionCallName,
            arguments: JSON.parse(functionCallArgs || '{}'),
          },
        };
      }
    } catch (error) {
      logger.error('OpenAI streaming error:', error);
      throw error;
    }
  }
}

export default OpenAIService;
