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

  // Common model variations to test
  const testModels = [
    // NVIDIA variations
    'meta/nemotron-70b-instruct',
    'nvidia/nemotron-70b',
    'nvidia/nemotron-70b-v1',
    'nvidia/llama-3.1-nemotron-70b-instruct',
    
    // DeepSeek variations
    'deepseek/deepseek-chat',
    'deepseek/deepseek-reasoner',
    'deepseek/deepseek-v2-chat',
    
    // OpenAI variations
    'openai/gpt-3.5-turbo',
    'openai/gpt-4',
    
    // Alternatives if above don't work
    'anthropic/claude-3-haiku',
    'google/gemini-pro',
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
    note: 'Use the model IDs marked as ✅ Available in lib/llm/providers.ts'
  });
}

