/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { config } from 'dotenv';
import {
  GoogleGenerativeAI,
  GenerateContentResult,
} from '@google/generative-ai';

config();

@Injectable()
export class GeminiService {
  private client: GoogleGenerativeAI;
  private model: string;
  private readonly logger = new Logger(GeminiService.name);

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not found in .env — Gemini service disabled, fallback heuristics will be used.');
      return;
    }

    this.client = new GoogleGenerativeAI(apiKey);
    this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  }

 
  async evaluateWithGemini(prompt: string): Promise<string | null> {
    if (!this.client) {
      this.logger.warn('No Gemini client initialized — skipping evaluation.');
      return null;
    }

    try {
      const model = this.client.getGenerativeModel({ model: this.model });

      const result: GenerateContentResult = await model.generateContent(prompt);

      if (result.response && typeof result.response.text === 'function') {
        return result.response.text();
      }

      // @ts-ignore fallback if SDK response shape changes
      return result.outputText || JSON.stringify(result);
    } catch (err: any) {
      this.logger.error('Gemini API error: ' + (err?.message || err));
      return null;
    }
  }
}
