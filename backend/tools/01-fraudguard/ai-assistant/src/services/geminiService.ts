/**
 * Google Gemini Service
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider, ChatOptions, StreamChunk } from './llmRouter.js';
import { logger } from '../utils/logger.js';

export class GeminiService implements LLMProvider {
  name = 'gemini';
  private client: GoogleGenerativeAI | null = null;
  private model = 'gemini-pro';

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.client = new GoogleGenerativeAI(apiKey);
      logger.info('Gemini service initialized');
    } else {
      logger.warn('Gemini API key not configured');
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async *streamChat(message: string, options: ChatOptions): AsyncGenerator<StreamChunk> {
    if (!this.client) {
      throw new Error('Gemini client not initialized');
    }

    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      
      const chat = model.startChat({
        history: [],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 2048,
        },
      });

      // Prepend system prompt if provided
      const prompt = options.systemPrompt 
        ? `${options.systemPrompt}\n\nUser: ${message}`
        : message;

      const result = await chat.sendMessageStream(prompt);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield { type: 'text', content: text };
        }
      }
    } catch (error) {
      logger.error('Gemini streaming error:', error);
      throw error;
    }
  }
}

export default GeminiService;
