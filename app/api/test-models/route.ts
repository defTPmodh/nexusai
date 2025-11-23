import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Test which OpenRouter models are available
export async function GET() {
  const openrouterClient = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Nexus-AI',
    },
  });

  const testModels = [
    'x-ai/grok-4.1-fast:free',
    'openai/gpt-oss-20b:free',
  ];

  const results: Record<string, any> = {};

  for (const model of testModels) {
    try {
      const response = await openrouterClient.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
      });
      results[model] = { status: 'success', response: response.model };
    } catch (error: any) {
      results[model] = { status: 'error', message: error.message };
    }
  }

  return NextResponse.json(results);
}

