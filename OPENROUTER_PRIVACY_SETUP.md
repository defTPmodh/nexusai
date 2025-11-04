# OpenRouter Privacy Settings Fix

## Error
```
404 No endpoints found matching your data policy (Free model publication)
```

## Solution

You need to configure your OpenRouter privacy settings to allow free models.

### Steps:

1. **Go to OpenRouter Settings**: https://openrouter.ai/settings/privacy

2. **Configure Data Policy**:
   - Find "Free Model Publication" or "Data Policy" section
   - Enable **"Allow free models"** or similar setting
   - This allows models with `:free` suffix to be used

3. **Alternative: Remove `:free` suffix**
   - If you don't want to use free models, remove the `:free` suffix from model IDs
   - Models without `:free` use paid pricing from OpenRouter
   - Updated the code to use models without `:free` suffix

## Current Configuration

The code now uses model IDs **without** the `:free` suffix:
- `nvidia/nemotron-nano-12b-v2-vl`
- `deepseek/deepseek-chat-v3.1`
- `openai/gpt-oss-20b`

If you want to use free models:
1. Configure privacy settings at https://openrouter.ai/settings/privacy
2. Add `:free` back to model IDs in `lib/llm/providers.ts`

## Testing

After configuring privacy settings (or using non-free models), try sending a message again in the chat interface.

