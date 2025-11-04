# Quick Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with your actual API keys:

```env
# Auth0 Configuration
AUTH0_SECRET=<generate-random-32-char-string>
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=<your-auth0-client-id>
AUTH0_CLIENT_SECRET=<your-auth0-client-secret>

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>

# OpenRouter API Key (unified gateway for all models)
OPENROUTER_API_KEY=sk-or-v1-...your-openrouter-key...

# Optional: App URL for OpenRouter tracking
NEXT_PUBLIC_APP_URL=http://localhost:3000

# PII Detection
PII_DETECTION_ENABLED=true
```

## Important Security Note

⚠️ **NEVER commit your `.env.local` file to git!** It's already in `.gitignore`.

Your API keys are sensitive credentials. Keep them secure and private.

## Next Steps

1. Create `.env.local` with the values above
2. Run database migrations in Supabase
3. Run seed data
4. Start the dev server: `npm run dev`

