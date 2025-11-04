# Fixing Model IDs for OpenRouter

The error indicates the OpenRouter model ID is incorrect. Here's how to fix it:

## Current Error
```
nvidia/nemotron-70b-instruct is not a valid model ID
```

## How to Find Correct Model IDs

1. **Visit OpenRouter Models Page**: https://openrouter.ai/models
2. **Search for your models**:
   - Search "nemotron" for NVIDIA
   - Search "deepseek" for DeepSeek
   - Search "gpt" for OpenAI

3. **Use the exact model ID** shown on OpenRouter

## Update the Mapping

Edit `lib/llm/providers.ts` and update the `OPENROUTER_MODELS` object:

```typescript
const OPENROUTER_MODELS: Record<string, string> = {
  'nemotron-nano-12b-2-vl': 'CORRECT-OPENROUTER-MODEL-ID-HERE',
  'deepseek-v3.1': 'CORRECT-OPENROUTER-MODEL-ID-HERE',
  'gpt-oss-20b': 'CORRECT-OPENROUTER-MODEL-ID-HERE',
};
```

## Common OpenRouter Model IDs

Based on common naming:
- NVIDIA: `nvidia/nemotron-70b-v1` or `meta/nemotron-70b-instruct` or `nvidia/nemotron-4-70b`
- DeepSeek: `deepseek/deepseek-chat` or `deepseek/deepseek-reasoner`
- OpenAI: `openai/gpt-3.5-turbo` or `openai/gpt-4`

## Testing

After updating, test each model in the chat interface to verify they work.

## Quick Alternative

If you can't find the exact models, you can use these common alternatives that are likely available:
- `anthropic/claude-3-haiku` (very fast, cheap)
- `google/gemini-pro` (good alternative)
- `meta-llama/llama-3-8b-instruct` (open source)

