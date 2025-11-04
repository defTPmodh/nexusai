# API Keys Setup - OpenRouter

Your app is configured to use **OpenRouter** as the unified API gateway for all LLM providers.

## Environment Variables

Create a `.env.local` file in the root directory with the following:

```env
# OpenRouter API Key (unified gateway for all models)
OPENROUTER_API_KEY=sk-or-v1-...your-openrouter-key-here...

# Optional: Fallback to OPENAI_API_KEY if OPENROUTER_API_KEY is not set
OPENAI_API_KEY=sk-or-v1-...your-key-here...

# App URL for OpenRouter tracking (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## OpenRouter Configuration

All three models route through OpenRouter:

1. **NVIDIA Nemotron Nano 12B 2 VL** 
   - OpenRouter Model ID: `nvidia/nemotron-70b-instruct`
   - Mapped from: `nemotron-nano-12b-2-vl`

2. **DeepSeek V3.1**
   - OpenRouter Model ID: `deepseek/deepseek-chat`
   - Mapped from: `deepseek-v3.1`

3. **OpenAI GPT-OSS-20B**
   - OpenRouter Model ID: `openai/gpt-3.5-turbo` (adjust if different)
   - Mapped from: `gpt-oss-20b`

## Model Name Mapping

If OpenRouter uses different model IDs, update the `OPENROUTER_MODELS` mapping in `lib/llm/providers.ts`:

```typescript
const OPENROUTER_MODELS: Record<string, string> = {
  'nemotron-nano-12b-2-vl': 'nvidia/nemotron-70b-instruct',
  'deepseek-v3.1': 'deepseek/deepseek-chat',
  'gpt-oss-20b': 'openai/gpt-3.5-turbo', // Update this if different
};
```

## Finding Correct Model IDs

To find the correct OpenRouter model IDs:

1. Visit [OpenRouter Models](https://openrouter.ai/models)
2. Search for your models:
   - NVIDIA Nemotron
   - DeepSeek
   - OpenAI GPT-OSS-20B
3. Update the mapping in `lib/llm/providers.ts` with the exact model IDs

## Benefits of OpenRouter

✅ **Single API key** for all providers  
✅ **Unified interface** - no need to manage multiple API keys  
✅ **Cost tracking** - see usage across all models  
✅ **Easy model switching** - add new models without code changes  
✅ **Rate limiting** handled by OpenRouter  

## Testing

After setting up your `.env.local`:

1. Run `npm run dev`
2. Test each model in the chat interface
3. Check OpenRouter dashboard for usage statistics

## Important Notes

⚠️ **Security**: Never commit `.env.local` to git. It's already in `.gitignore`.

⚠️ **Model IDs**: OpenRouter model IDs may differ from direct provider names. Always verify the correct model ID in OpenRouter's documentation.
