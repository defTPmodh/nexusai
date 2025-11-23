import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Helper endpoint to find available OpenRouter models
export async function GET() {
  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: 'OPENROUTER_API_KEY not set' }, { status: 500 });
  }

  const openrouterClient = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Nexus-AI',
    },
  });

  // Only probe the allowlisted OpenRouter models
  const testModels = [
    'x-ai/grok-4.1-fast:free',
    'openai/gpt-oss-20b:free',
  ];

  const results: Record<string, any> = {};

  for (const modelId of testModels) {
    try {
      const response = await openrouterClient.chat.completions.create({
        model: modelId,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
      });
      results[modelId] = { 
        status: '✅ Available', 
        actualModel: response.model,
        works: true 
      };
    } catch (error: any) {
      results[modelId] = { 
        status: '❌ Not available', 
        error: error.message,
        works: false 
      };
    }
  }

  return NextResponse.json({
    message: 'Tested OpenRouter models',
    results,
    note: 'Only the allowlisted models in lib/llm/providers.ts are supported.'
  });
}

