import OpenAI from 'openai';
import { LLMProvider, LLMModel } from '@/types';

export interface LLMResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

// Initialize OpenRouter client (unified gateway for all models)
const openrouterClient = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'Nexus-AI',
  },
});

// Model name mapping for OpenRouter
// Note: Remove :free suffix if you want to use paid models or configure privacy settings
// For free models, configure privacy at: https://openrouter.ai/settings/privacy
const OPENROUTER_MODELS: Record<string, string> = {
  // NVIDIA Nemotron Nano 12B 2 VL
  'nemotron-nano-12b-2-vl': 'nvidia/nemotron-nano-12b-v2-vl',
  // DeepSeek V3.1
  'deepseek-v3.1': 'deepseek/deepseek-chat-v3.1',
  // OpenAI GPT-OSS-20B
  'gpt-oss-20b': 'openai/gpt-oss-20b',
  // Minimax M2 Free
  'minimax-m2:free': 'minimax/minimax-m2:free',
};

export async function callLLM(
  config: LLMConfig,
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
): Promise<LLMResponse> {
  const startTime = Date.now();

  try {
    // All models route through OpenRouter
    const openrouterModel = OPENROUTER_MODELS[config.model] || config.model;

    const response = await openrouterClient.chat.completions.create({
      model: openrouterModel,
      messages: messages as any,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens,
    });

    const choice = response.choices[0];
    return {
      content: choice.message.content || '',
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
      model: response.model,
    };
  } catch (error: any) {
    // Provide more detailed error information
    const errorMsg = error.message || 'Unknown error';
    const statusCode = error.status || error.response?.status;
    const openrouterModel = OPENROUTER_MODELS[config.model] || config.model;
    
    if (statusCode === 400 && errorMsg.includes('not a valid model ID')) {
      throw new Error(`Invalid model ID: ${openrouterModel}. Check available models at https://openrouter.ai/models or use /api/find-models endpoint`);
    }
    
    throw new Error(`LLM API error (${statusCode || 'unknown'}): ${errorMsg}`);
  }
}

export function calculateCost(
  model: LLMModel,
  inputTokens: number,
  outputTokens: number
): number {
  const inputCost = (inputTokens / 1000) * Number(model.cost_per_1k_input_tokens);
  const outputCost = (outputTokens / 1000) * Number(model.cost_per_1k_output_tokens);
  return inputCost + outputCost;
}
